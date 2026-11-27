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

const [email, password, role = "admin", fullName = "Pathixo Admin"] = process.argv.slice(2);

if (!email || !password) {
  console.log(`
Usage:
  node scripts/create-admin.mjs <email> <password> [role] [fullName]

Roles:
  super_admin | admin | viewer (default: admin)

Example:
  node scripts/create-admin.mjs founder@pathixo.com SecurePassword123 super_admin "Abhijeet Jha"
`);
  process.exit(1);
}

async function createAdminUser() {
  console.log(`\nCreating admin account for ${email} with role: ${role}...`);

  // 1. Create or get user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let userId;
  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("User already exists in Supabase Auth. Fetching user ID...");
      const { data: userList } = await supabase.auth.admin.listUsers();
      const existing = userList.users.find((u) => u.email === email);
      if (!existing) {
        console.error("Could not find existing user in user list.");
        process.exit(1);
      }
      userId = existing.id;
      // Update password
      await supabase.auth.admin.updateUserById(userId, { password });
      console.log("Updated password for existing user.");
    } else {
      console.error("Auth creation failed:", authError.message);
      process.exit(1);
    }
  } else {
    userId = authData.user.id;
    console.log("Created Supabase Auth user:", userId);
  }

  // 2. Upsert into public.admins table
  const { error: adminError } = await supabase.from("admins").upsert({
    id: userId,
    email,
    role,
    full_name: fullName,
  });

  if (adminError) {
    console.error("Failed to insert into public.admins:", adminError.message);
    process.exit(1);
  }

  console.log(`SUCCESS: Admin account ready!`);
  console.log(`  Email: ${email}`);
  console.log(`  Role:  ${role}`);
  console.log(`  Name:  ${fullName}`);
  console.log(`You can now log in at /admin/login\n`);
}

createAdminUser();
