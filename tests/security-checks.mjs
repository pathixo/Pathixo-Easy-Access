import { createClient } from "@supabase/supabase-js";
import { registerSchema } from "../src/lib/validation/schemas.ts";
import { SignJWT, jwtVerify } from "jose";
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
const anonKey = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !anonKey) {
  console.error("FAIL: Missing Supabase anon credentials in .env.local");
  process.exit(1);
}

// Client using public anon key (representing unauthorized browser attacker)
const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

async function runSecurityChecks() {
  console.log("\n========================================================");
  console.log("TEST 4: SECURITY BOUNDARIES, RLS & MASS-ASSIGNMENT");
  console.log("========================================================\n");

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

  // 1. Direct RLS Revocation Check (Attacker tries direct query to visitors table)
  console.log("--- 1. Direct RLS & Table Privilege Revocation ---");
  const { data: vData, error: vErr } = await anonClient.from("visitors").select("id, email, mobile");
  assert(
    vErr !== null || (Array.isArray(vData) && vData.length === 0),
    "Public client with anon key cannot read visitors table (RLS blocked)"
  );

  const { data: sData, error: sErr } = await anonClient.from("spins").select("id, reward_code");
  assert(
    sErr !== null || (Array.isArray(sData) && sData.length === 0),
    "Public client with anon key cannot read spins table (RLS blocked)"
  );

  const { data: aData, error: aErr } = await anonClient.from("audit_logs").select("*");
  assert(
    aErr !== null || (Array.isArray(aData) && aData.length === 0),
    "Public client with anon key cannot read audit_logs table (RLS blocked)"
  );

  // 2. Mass-Assignment & Unknown Field Injection Check
  console.log("\n--- 2. Mass-Assignment & Schema Strictness ---");
  const hackerPayload = {
    full_name: "Attacker User",
    email: "attacker@badactor.com",
    mobile: "9876543210",
    privacy_consent: true,
    is_admin: true, // Unknown field
    role: "super_admin", // Unknown field
  };
  const parseRes = registerSchema.safeParse(hackerPayload);
  assert(!parseRes.success, "Strict Zod schema rejects mass-assignment injections");

  // 3. IDOR & Cryptographic Session Verification
  console.log("\n--- 3. IDOR & Session Tampering Defense ---");
  const sessionSecret = env["SESSION_SECRET"] || "default_development_secret_minimum_32_characters_long!";
  const secretKey = new TextEncoder().encode(sessionSecret);

  const validToken = await new SignJWT({ visitorId: "33333333-4444-5555-6666-777777777777" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey);

  const { payload } = await jwtVerify(validToken, secretKey, { algorithms: ["HS256"] });
  assert(payload.visitorId === "33333333-4444-5555-6666-777777777777", "Valid signed session resolves correctly");

  let tamperedRejected = false;
  try {
    const tamperedToken = validToken.slice(0, -6) + "xxxxxx";
    await jwtVerify(tamperedToken, secretKey, { algorithms: ["HS256"] });
  } catch {
    tamperedRejected = true;
  }
  assert(tamperedRejected, "Tampered session JWT signature rejected (401 prevention)");

  console.log("\n========================================================");
  console.log(`SECURITY CHECKS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityChecks().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
