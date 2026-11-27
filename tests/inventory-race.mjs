import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Safely parse .env.local without exposing secrets
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceKey) {
  console.error("FAIL: Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function runInventoryRaceTest() {
  console.log("\n========================================================");
  console.log("TEST 2: 100 CONCURRENT VISITORS RACING FOR 5 INVENTORY");
  console.log("========================================================\n");

  const uniqueSuffix = Date.now().toString().slice(-6);

  // 1. Create a limited test reward with inventory = 5
  const { data: limitedReward, error: rewErr } = await supabase
    .from("rewards")
    .insert({
      slug: `race-limited-reward-${uniqueSuffix}`,
      name: "Exclusive Limited Swag Item",
      description: "Only 5 items available in inventory",
      reward_type: "merchandise",
      total_inventory: 5,
      remaining_inventory: 5,
      probability_weight: 100, // Highest weight
      is_active: true,
      expiry_days: 7,
    })
    .select("id, remaining_inventory")
    .single();

  if (rewErr || !limitedReward) {
    console.error("Failed to create limited test reward:", rewErr);
    process.exit(1);
  }

  // Ensure active fallback reward exists
  const { data: fallbackReward } = await supabase
    .from("rewards")
    .select("id")
    .eq("reward_type", "no_prize")
    .limit(1)
    .single();

  console.log(`Created limited test reward: ${limitedReward.id} with stock = 5`);
  console.log("Creating 100 distinct visitors...");

  // 2. Batch create 100 distinct test attendees
  const TOTAL_VISITORS = 100;
  const visitorInserts = [];
  for (let i = 0; i < TOTAL_VISITORS; i++) {
    visitorInserts.push({
      full_name: `Race Visitor ${i}`,
      email: `race.${uniqueSuffix}.${i}@pathixo-test.com`,
      mobile: `95${uniqueSuffix.slice(-4)}${i.toString().padStart(4, "0")}`,
      privacy_consent: true,
    });
  }

  const { data: createdVisitors, error: batchErr } = await supabase
    .from("visitors")
    .insert(visitorInserts)
    .select("id");

  if (batchErr || !createdVisitors || createdVisitors.length !== TOTAL_VISITORS) {
    console.error("Failed to batch create visitors:", batchErr);
    process.exit(1);
  }

  console.log(`Created 100 visitors. Firing 100 simultaneous spin requests...`);

  // 3. Fire 100 concurrent spin requests simultaneously
  const spinPromises = createdVisitors.map((v, i) =>
    supabase.rpc("spin_wheel", {
      p_visitor_id: v.id,
      p_idempotency_key: `race-key-${uniqueSuffix}-${i}`,
    })
  );

  const results = await Promise.all(spinPromises);

  // 4. Verify outcomes
  let limitedWonCount = 0;
  let fallbackCount = 0;

  results.forEach((r) => {
    if (r.data && r.data.ok) {
      if (r.data.reward_id === limitedReward.id) {
        limitedWonCount++;
      } else {
        fallbackCount++;
      }
    }
  });

  // 5. Check remaining inventory
  const { data: updatedReward } = await supabase
    .from("rewards")
    .select("remaining_inventory")
    .eq("id", limitedReward.id)
    .single();

  const finalStock = updatedReward?.remaining_inventory;

  console.log(`\nResults:`);
  console.log(`  - Total Concurrent Requests:   ${TOTAL_VISITORS}`);
  console.log(`  - Awarded Limited Prize:       ${limitedWonCount} (Target: exactly 5)`);
  console.log(`  - Received Fallback Prize:     ${fallbackCount} (Target: exactly 95)`);
  console.log(`  - Final Stock in Database:     ${finalStock} (Target: 0, NEVER negative)`);

  const passed =
    limitedWonCount === 5 &&
    fallbackCount === 95 &&
    finalStock === 0;

  // Cleanup
  const visitorIds = createdVisitors.map((v) => v.id);
  await supabase.from("spins").delete().in("visitor_id", visitorIds);
  await supabase.from("visitors").delete().in("id", visitorIds);
  await supabase.from("rewards").delete().eq("id", limitedReward.id);

  if (passed) {
    console.log("\n>>> PASS: Exactly 5 items allocated from 100 racers. Zero negative inventory!");
  } else {
    console.error("\n>>> FAIL: Race condition allowed inventory breach or misallocation!");
    process.exit(1);
  }
}

runInventoryRaceTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
