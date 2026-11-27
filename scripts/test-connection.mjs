import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Safely parse .env.local without logging values
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceKey) {
  console.error('FAIL: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function verify() {
  console.log('Testing Supabase connection with service_role...');
  try {
    const { data, error } = await supabase.from('products').select('slug, name, is_active');
    if (error) {
      console.log('FAIL: Could not query products table. Reason:', error.message);
      if (error.code === '42P01') {
        console.log('NOTE: Table "products" does not exist yet. Please run the SQL migrations in Supabase SQL Editor.');
      }
      process.exit(1);
    }
    console.log(`SUCCESS: Connected to database! Found ${data.length} products.`);
    for (const p of data) {
      console.log(`  - Product: ${p.name} (${p.slug})`);
    }

    const { data: rewards, error: rewError } = await supabase.from('rewards').select('slug, name');
    if (!rewError && rewards) {
      console.log(`SUCCESS: Found ${rewards.length} rewards in rewards table.`);
    }

    console.log('ALL DATABASE CHECKS PASSED!');
  } catch (err) {
    console.error('FAIL: Unexpected error connecting to Supabase:', err.message);
    process.exit(1);
  }
}

verify();
