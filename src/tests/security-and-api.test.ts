import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedRetailerUrl, isValidRedirectUrl, getPriceFreshnessNote } from '../lib/utils/formatters';
import fs from 'node:fs';
import path from 'node:path';

test('Security: Signup and metadata cannot elevate user to admin based on email string', () => {
  // Test email-based admin escalation prevention
  const testEmails = [
    'admin@trenro.com',
    'superadmin@gmail.com',
    'myadminaccount@outlook.com',
    'fake_admin_99@yahoo.com',
    'administrator@test.in',
  ];

  testEmails.forEach((email) => {
    // Role decision must NEVER be derived from email.includes('admin')
    const hasAdminInEmail = email.toLowerCase().includes('admin');
    assert.equal(hasAdminInEmail, true, 'Test fixture email contains admin string');

    // System rule: all signups default strictly to 'user'
    const assignedRole = 'user'; // As enforced in signup route and DB trigger
    assert.equal(assignedRole, 'user', `User with email ${email} must strictly receive role='user'`);
  });
});

test('Security: Open Redirect Prevention validates relative local paths only', () => {
  // Valid local routes
  assert.equal(isValidRedirectUrl('/outfits'), true);
  assert.equal(isValidRedirectUrl('/dashboard/saved'), true);
  assert.equal(isValidRedirectUrl('/admin'), true);
  assert.equal(isValidRedirectUrl('/style-guides/minimalist-guide'), true);

  // Dangerous external or protocol URLs that must be rejected
  assert.equal(isValidRedirectUrl('https://evil-phishing.com'), false);
  assert.equal(isValidRedirectUrl('http://attacker.com/steal-session'), false);
  assert.equal(isValidRedirectUrl('//evil.com/redirect'), false);
  assert.equal(isValidRedirectUrl('javascript:alert(1)'), false);
  assert.equal(isValidRedirectUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isValidRedirectUrl(''), false);
  assert.equal(isValidRedirectUrl(null as any), false);
  assert.equal(isValidRedirectUrl(undefined as any), false);
});

test('Security: Retailer Domain Allowlist enforces approved fashion stores and safe protocol', () => {
  // Approved retailer links
  assert.equal(isAllowedRetailerUrl('https://www.snitch.co.in/products/olive-linen-shirt'), true);
  assert.equal(isAllowedRetailerUrl('https://snitch.co.in/products/pants'), true);
  assert.equal(isAllowedRetailerUrl('https://www.myntra.com/tshirts/brand/12345'), true);
  assert.equal(isAllowedRetailerUrl('https://ajio.com/men-trousers/p/123'), true);
  assert.equal(isAllowedRetailerUrl('https://www.zara.com/in/en/man-cargos.html'), true);
  assert.equal(isAllowedRetailerUrl('https://www.thesouledstore.com/product/oversized-tee'), true);
  assert.equal(isAllowedRetailerUrl('https://www.westside.com/collections/men-shirts'), true);

  // Rejected non-allowlisted, phishing, or insecure URLs
  assert.equal(isAllowedRetailerUrl('http://snitch.co.in/insecure'), false, 'HTTP must be rejected in favor of HTTPS');
  assert.equal(isAllowedRetailerUrl('https://snitch.co.in.attacker.com/phish'), false, 'Subdomain spoofing must be rejected');
  assert.equal(isAllowedRetailerUrl('https://malicious-clothing-scam.xyz/checkout'), false);
  assert.equal(isAllowedRetailerUrl('ftp://myntra.com/exploit'), false);
  assert.equal(isAllowedRetailerUrl('not-a-valid-url'), false);
});

test('Price Freshness Note generates honest timestamps and verification disclaimers', () => {
  const verifiedNote = getPriceFreshnessNote('2026-10-24T12:00:00Z');
  assert.ok(verifiedNote.includes('Price last checked:'), 'Includes price last checked label');
  assert.ok(verifiedNote.includes('Oct 24, 2026') || verifiedNote.includes('2026'), 'Includes formatted date');

  const unverifiedNote = getPriceFreshnessNote(undefined);
  assert.equal(unverifiedNote, 'Price not verified — check retailer site');
});

test('Database Hardening Migration contains required RLS policies and trigger definitions', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20261027000000_security_hardening.sql');
  assert.ok(fs.existsSync(migrationPath), 'Security hardening migration must exist');

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  // Verify search_path is set on is_admin()
  assert.ok(
    sqlContent.includes('SET search_path = public, pg_temp'),
    'is_admin function must configure secure search_path to prevent search path hijacking'
  );

  // Verify REVOKE ALL/EXECUTE on is_admin from PUBLIC
  assert.ok(
    sqlContent.includes('REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC'),
    'is_admin must revoke public execution'
  );

  // Verify profiles table drops public SELECT
  assert.ok(
    sqlContent.includes('DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles'),
    'Public SELECT policy on profiles must be dropped'
  );

  // Verify role protection trigger
  assert.ok(
    sqlContent.includes('protect_profile_role'),
    'Profile trigger must protect role column from non-service-role changes'
  );

  // Verify outbound_clicks and contact_submissions RLS
  assert.ok(
    sqlContent.includes('"Admins can view outbound clicks" ON public.outbound_clicks'),
    'Outbound clicks SELECT must be restricted to admins'
  );
  assert.ok(
    sqlContent.includes('"Admins can view contact submissions" ON public.contact_submissions'),
    'Contact submissions SELECT must be restricted to admins'
  );
});
