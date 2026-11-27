import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { escapeCsvCell, buildCsv, formatKolkataTime } from "../src/lib/admin/utils.ts";

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

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runAdminTests() {
  console.log("\n========================================================");
  console.log("RUNNING PHASE 4 ADMIN SECURITY & REDEMPTION TEST SUITE");
  console.log("========================================================\n");

  // ----------------------------------------------------
  // SECTION 1: CSV Formula Injection Neutralization
  // ----------------------------------------------------
  console.log("--- 1. CSV Formula Injection Defense ---");

  const evilFormula1 = "=1+2";
  const escaped1 = escapeCsvCell(evilFormula1);
  assert(escaped1 === "\"'=1+2\"", "Neutralizes '=' formula injection with prepended quote");

  const evilFormula2 = "@SUM(A1:A10)";
  const escaped2 = escapeCsvCell(evilFormula2);
  assert(escaped2 === "\"'@SUM(A1:A10)\"", "Neutralizes '@' formula injection");

  const evilFormula3 = "+cmd|' /C calc'!A0";
  const escaped3 = escapeCsvCell(evilFormula3);
  assert(escaped3.startsWith("\"'+"), "Neutralizes '+' formula injection");

  const safeText = "Aarav Sharma";
  assert(escapeCsvCell(safeText) === '"Aarav Sharma"', "Leaves regular text intact");

  const csvOutput = buildCsv(["Name", "Payload"], [["Normal", "=dangerous"]]);
  assert(csvOutput.includes("\"'=dangerous\""), "buildCsv properly escapes table rows");

  // ----------------------------------------------------
  // SECTION 2: Asia/Kolkata Timezone Display
  // ----------------------------------------------------
  console.log("\n--- 2. Asia/Kolkata (IST) Timezone Formatting ---");
  const testUtc = "2026-01-15T06:30:00.000Z"; // 12:00 PM IST
  const formattedTime = formatKolkataTime(testUtc);
  assert(formattedTime.includes("IST"), "Appends IST identifier");
  assert(formattedTime.includes("12:00"), "Calculates correct UTC+5:30 offset");

  // ----------------------------------------------------
  // SECTION 3: Stall Redemption & Audit Trail Flow
  // ----------------------------------------------------
  console.log("\n--- 3. Voucher Redemption & Audit Trail Flow ---");
  const uniqueId = Date.now().toString().slice(-6);

  // Create a test visitor
  const { data: testVisitor } = await supabase
    .from("visitors")
    .insert({
      full_name: "Admin Test Attendee",
      email: `admin.test.${uniqueId}@pathixo.com`,
      mobile: `99${uniqueId.padStart(8, "1")}`,
      privacy_consent: true,
    })
    .select("id")
    .single();

  // Create test reward & spin record
  const { data: testReward } = await supabase
    .from("rewards")
    .select("id")
    .limit(1)
    .single();

  const testVoucherCode = `PX-TEST-${uniqueId}`;
  const { data: testSpin } = await supabase
    .from("spins")
    .insert({
      visitor_id: testVisitor.id,
      reward_id: testReward.id,
      idempotency_key: `key-${uniqueId}`,
      reward_code: testVoucherCode,
      redemption_status: "not_redeemed",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    })
    .select("id, reward_code, redemption_status")
    .single();

  assert(testSpin?.reward_code === testVoucherCode, "Created unredeemed test spin");

  // Simulate admin marking voucher as redeemed
  const now = new Date().toISOString();
  const { data: redeemedSpin, error: redeemErr } = await supabase
    .from("spins")
    .update({
      redemption_status: "redeemed",
      redeemed_at: now,
    })
    .eq("id", testSpin.id)
    .select("redemption_status, redeemed_at")
    .single();

  assert(!redeemErr && redeemedSpin.redemption_status === "redeemed", "Successfully marks voucher as redeemed");

  // Insert audit log
  const { error: auditErr } = await supabase.from("audit_logs").insert({
    action: "redeem_voucher_test",
    entity_type: "spins",
    entity_id: testSpin.id,
    details: { reward_code: testVoucherCode },
  });
  assert(!auditErr, "Records redemption event in audit_logs table");

  // Cleanup test data
  await supabase.from("spins").delete().eq("id", testSpin.id);
  await supabase.from("visitors").delete().eq("id", testVisitor.id);

  console.log("\n========================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
