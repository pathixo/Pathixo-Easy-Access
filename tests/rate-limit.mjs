import { registerRateLimiter } from "../src/lib/security/rate-limit.ts";

async function runRateLimitTest() {
  console.log("\n========================================================");
  console.log("TEST 3: RATE LIMITING BURST PROTECTION");
  console.log("========================================================\n");

  const testIp = `198.51.100.${Math.floor(Math.random() * 200 + 1)}`;
  console.log(`Testing IP client: ${testIp}`);
  console.log("Firing 20 consecutive requests through registerRateLimiter (Max: 5/min)...");

  let accepted = 0;
  let rejected = 0;

  for (let i = 1; i <= 20; i++) {
    const res = await registerRateLimiter.limit(testIp);
    if (res.success) {
      accepted++;
    } else {
      rejected++;
    }
  }

  console.log(`\nResults:`);
  console.log(`  - Requests Sent:      20`);
  console.log(`  - Accepted:           ${accepted} (Target: 5)`);
  console.log(`  - Rate Limited (429): ${rejected} (Target: 15)`);

  const passed = accepted === 5 && rejected === 15;

  if (passed) {
    console.log("\n>>> PASS: Rate limiter strictly capped at 5 requests and rejected 15 burst attempts!");
  } else {
    console.error("\n>>> FAIL: Rate limiter threshold violated!");
    process.exit(1);
  }
}

runRateLimitTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
