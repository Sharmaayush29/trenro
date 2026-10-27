/**
 * TRENRO ADMIN PROVISIONING SCRIPT
 * Secure, server-side one-time command to provision an authorized administrator.
 *
 * Usage:
 *   npm run admin:create <admin-email>
 *   or: npx tsx scripts/provision-admin.ts <admin-email>
 *
 * Example:
 *   npm run admin:create admin@trenro.com
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Safely load environment variables from .env.local without external packages
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function provisionAdmin() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  if (!targetEmail) {
    console.error('❌ Error: Please specify the email address to promote to admin.');
    console.error('Usage: npm run admin:create <email>');
    process.exit(1);
  }

  if (!targetEmail.includes('@') || !targetEmail.includes('.')) {
    console.error('❌ Error: Invalid email address format.');
    process.exit(1);
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env.local');
    console.error('This script requires the service_role key to safely update the protected profiles table.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`🔍 Looking up user account for: ${targetEmail}...`);

  // 1. Check if user exists in public.profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, email, role')
    .eq('email', targetEmail)
    .single();

  if (profileError || !profile) {
    console.error(`❌ User not found with email "${targetEmail}".`);
    console.log('👉 Please register this account first through the website (/signup), then re-run this script to promote it.');
    process.exit(1);
  }

  if (profile.role === 'admin') {
    console.log(`ℹ️ User "${targetEmail}" already has administrator privileges.`);
    process.exit(0);
  }

  // 2. Promote to admin in public.profiles
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: 'admin',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('❌ Failed to update role in profiles table:', updateError.message);
    process.exit(1);
  }

  // 3. Log audit record safely
  try {
    await supabase.from('admin_audit_logs').insert({
      action: 'PROVISION_INITIAL_ADMIN',
      target_entity: 'profiles',
      target_id: profile.id,
      details: {
        promoted_email: targetEmail,
        method: 'cli_provisioning_script',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    // Non-fatal if audit table not yet migrated
  }

  console.log('====================================================');
  console.log('✅ SUCCESS: Administrator privileges granted!');
  console.log(`   User: ${profile.display_name} (${targetEmail})`);
  console.log(`   User ID: ${profile.id}`);
  console.log(`   Role: admin`);
  console.log('   The user can now sign in and access /admin.');
  console.log('====================================================');
}

provisionAdmin().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
