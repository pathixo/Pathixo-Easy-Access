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

async function runConcurrencyTest() {
  console.log("\n========================================================");
  console.log("TEST 1: 50 CONCURRENT SPINS ON SINGLE VISITOR");
  console.log("========================================================\n");

  const uniqueSuffix = Date.now().toString().slice(-6);

  // 1. Create a single test attendee
  const { data: visitor, error: vErr } = await supabase
    .from("visitors")
    .insert({
      full_name: "Concurrency Test Visitor",
      email: `concurrency.${uniqueSuffix}@pathixo-test.com`,
      mobile: `96${uniqueSuffix.padStart(8, "0")}`,
      privacy_consent: true,
    })
    .select("id")
    .single();

  if (vErr || !visitor) {
    console.error("Failed to create test visitor:", vErr);
    process.exit(1);
  }

  console.log(`Created test visitor: ${visitor.id}`);
  console.log("Firing 50 parallel spin_wheel RPC calls simultaneously...");

  // 2. Dispatch 50 parallel requests
  const PARALLEL_COUNT = 50;
  const promises = [];
  for (let i = 0; i < PARALLEL_COUNT; i++) {
    const idempotencyKey = `concurrency-req-${uniqueSuffix}-${i}`;
    promises.push(
      supabase.rpc("spin_wheel", {
        p_visitor_id: visitor.id,
        p_idempotency_key: idempotencyKey,
      })
    );
  }

  const results = await Promise.all(promises);

  // 3. Analyze results
  let successCount = 0;
  let alreadySpunCount = 0;
  let firstRewardCode = null;
  let allCodesMatch = true;

  results.forEach((res, i) => {
    if (res.data && res.data.ok === true) {
      successCount++;
      if (res.data.already_spun) {
        alreadySpunCount++;
      }
      if (!firstRewardCode) {
        firstRewardCode = res.data.reward_code;
      } else if (res.data.reward_code !== firstRewardCode) {
        allCodesMatch = false;
      }
    } else {
      console.error(`Request ${i} failed:`, res.error || res.data);
    }
  });

  // 4. Verify DB row count
  const { count: actualSpinsCount } = await supabase
    .from("spins")
    .select("*", { count: "exact", head: true })
    .eq("visitor_id", visitor.id);

  console.log(`\nResults:`);
  console.log(`  - Total Parallel Requests:     ${PARALLEL_COUNT}`);
  console.log(`  - Successful Responses:        ${successCount}/${PARALLEL_COUNT}`);
  console.log(`  - Unique Rows in DB:           ${actualSpinsCount}`);
  console.log(`  - Vouchers Matched Identical:  ${allCodesMatch}`);
  console.log(`  - Assigned Voucher Code:       ${firstRewardCode}`);

  const passed =
    successCount === PARALLEL_COUNT &&
    actualSpinsCount === 1 &&
    allCodesMatch === true;

  // Cleanup
  await supabase.from("spins").delete().eq("visitor_id", visitor.id);
  await supabase.from("visitors").delete().eq("id", visitor.id);

  if (passed) {
    console.log("\n>>> PASS: Exactly 1 spin inserted under 50 simultaneous concurrent requests!");
  } else {
    console.error("\n>>> FAIL: Concurrency race condition detected!");
    process.exit(1);
  }
}

runConcurrencyTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
