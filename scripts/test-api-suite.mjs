import { createClient } from "@supabase/supabase-js";
import { SignJWT, jwtVerify } from "jose";
import fs from "fs";
import { registerSchema, inquirySchema, normalizeIndianMobile } from "../src/lib/validation/schemas.ts";

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
const sessionSecret = env["SESSION_SECRET"] || "default_development_secret_minimum_32_characters_long!";

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

async function runTests() {
  console.log("\n========================================================");
  console.log("RUNNING PHASE 2 BACKEND API & VALIDATION TEST SUITE");
  console.log("========================================================\n");

  // ----------------------------------------------------
  // SECTION 1: Mobile & Email Normalization
  // ----------------------------------------------------
  console.log("--- 1. Input Normalization & Validation ---");

  assert(normalizeIndianMobile("+91 98765 43210") === "9876543210", "Strips +91 and spaces from mobile");
  assert(normalizeIndianMobile("09876543210") === "9876543210", "Strips leading 0 from 11-digit mobile");
  assert(normalizeIndianMobile("9876543210") === "9876543210", "Preserves clean 10-digit mobile");

  const validReg = registerSchema.safeParse({
    full_name: "Aarav Sharma",
    email: "AARAV.SHARMA@Example.COM",
    mobile: "+91 9876543210",
    privacy_consent: true,
  });
  assert(validReg.success, "Valid registration parses cleanly");
  if (validReg.success) {
    assert(validReg.data.email === "aarav.sharma@example.com", "Email is lowercased");
    assert(validReg.data.mobile === "9876543210", "Mobile is normalized to 10 digits");
  }

  const badMobile = registerSchema.safeParse({
    full_name: "Bad Mobile",
    email: "test@example.com",
    mobile: "5123456789", // Starts with 5 (invalid in India)
    privacy_consent: true,
  });
  assert(!badMobile.success, "Rejects mobile starting with 5 (non-Indian prefix)");

  const badConsent = registerSchema.safeParse({
    full_name: "No Consent",
    email: "test2@example.com",
    mobile: "9876543210",
    privacy_consent: false,
  });
  assert(!badConsent.success, "Rejects registration when privacy_consent is false");

  const unknownFields = registerSchema.safeParse({
    full_name: "Hacker User",
    email: "test3@example.com",
    mobile: "9876543210",
    privacy_consent: true,
    hacker_role: "admin", // Unknown field
  });
  assert(!unknownFields.success, "Strict schema rejects unknown fields (no mass-assignment)");

  // ----------------------------------------------------
  // SECTION 2: Signed Visitor Session Cookie (jose)
  // ----------------------------------------------------
  console.log("\n--- 2. Cryptographic Visitor Session (jose) ---");
  const secretKey = new TextEncoder().encode(sessionSecret);
  const testVisitorId = "11111111-2222-3333-4444-555555555555";

  const token = await new SignJWT({ visitorId: testVisitorId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey);

  assert(typeof token === "string" && token.length > 20, "Generates signed HS256 JWT");

  const verified = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
  assert(verified.payload.visitorId === testVisitorId, "Verifies authentic visitor token");

  // Tampered token test
  let tamperedFailed = false;
  try {
    const tampered = token.slice(0, -5) + "abcde";
    await jwtVerify(tampered, secretKey, { algorithms: ["HS256"] });
  } catch {
    tamperedFailed = true;
  }
  assert(tamperedFailed, "Rejects tampered session token (401 prevention)");

  // ----------------------------------------------------
  // SECTION 3: Database Registration & Deduplication
  // ----------------------------------------------------
  console.log("\n--- 3. Database Registration & Deduplication ---");
  const uniqueSuffix = Date.now().toString().slice(-6);
  const testEmail = `test.suite.${uniqueSuffix}@pathixo-test.com`;
  const testMobile = `98${uniqueSuffix.padStart(8, "0")}`;

  const { data: insertedVisitor, error: insertErr } = await supabase
    .from("visitors")
    .insert({
      full_name: "Automated Test Visitor",
      email: testEmail,
      mobile: testMobile,
      company: "Pathixo Test Lab",
      privacy_consent: true,
      campaign_id: "expo_mart_2026",
    })
    .select("id")
    .single();

  assert(!insertErr && insertedVisitor?.id, "Inserts new visitor into visitors table");

  // Attempt duplicate registration with same email
  const { error: dupErr } = await supabase
    .from("visitors")
    .insert({
      full_name: "Duplicate Visitor",
      email: testEmail.toUpperCase(),
      mobile: `97${uniqueSuffix.padStart(8, "0")}`,
      privacy_consent: true,
    });
  assert(dupErr && dupErr.code === "23505", "Blocks duplicate email via unique index (23505)");

  // ----------------------------------------------------
  // SECTION 4: Spin Wheel Execution & Idempotency
  // ----------------------------------------------------
  console.log("\n--- 4. Spin Wheel RPC & Idempotency ---");
  const idempotencyKey1 = `test-key-${Date.now()}-1`;
  const idempotencyKey2 = `test-key-${Date.now()}-2`;

  const { data: spin1, error: spin1Err } = await supabase.rpc("spin_wheel", {
    p_visitor_id: insertedVisitor.id,
    p_idempotency_key: idempotencyKey1,
  });

  assert(!spin1Err && spin1?.ok === true, "Executes spin_wheel RPC successfully");
  assert(spin1?.already_spun === false, "First spin returns already_spun = false");
  assert(typeof spin1?.reward_code === "string" && spin1.reward_code.startsWith("PX-"), "Generated reward code matches PX-XXXX-XXXX");

  // Retry spin with new idempotency key -> Must return existing spin
  const { data: spin2, error: spin2Err } = await supabase.rpc("spin_wheel", {
    p_visitor_id: insertedVisitor.id,
    p_idempotency_key: idempotencyKey2,
  });

  assert(!spin2Err && spin2?.ok === true, "Second spin call succeeds gracefully");
  assert(spin2?.already_spun === true, "Second spin returns already_spun = true");
  assert(spin2?.reward_code === spin1?.reward_code, "Idempotency guaranteed: returns identical reward code");

  // Call spin with invalid visitor ID
  const { data: invalidSpin } = await supabase.rpc("spin_wheel", {
    p_visitor_id: "00000000-0000-0000-0000-000000000000",
    p_idempotency_key: `invalid-${Date.now()}`,
  });
  assert(invalidSpin?.ok === false, "Rejects invalid visitor ID with ok = false");

  // ----------------------------------------------------
  // SECTION 5: Products Catalog Query
  // ----------------------------------------------------
  console.log("\n--- 5. Products Catalog Endpoint ---");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("slug, name, is_active")
    .eq("is_active", true);

  assert(!prodErr && products.length >= 3, "Fetches active public product catalog");

  // Cleanup test data
  await supabase.from("spins").delete().eq("visitor_id", insertedVisitor.id);
  await supabase.from("visitors").delete().eq("id", insertedVisitor.id);

  console.log("\n========================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
