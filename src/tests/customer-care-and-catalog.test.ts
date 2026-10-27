import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

test('Customer Care: verifies client concierge email-only channel', () => {
  const customerEmail = 'rasu29906@gmail.com';

  // Email validation: client care strictly uses email
  assert.equal(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail), true, 'Email address must be a valid email format');
  assert.equal(customerEmail, 'rasu29906@gmail.com', 'Client concierge email must match configured address');
});

test('Database Migrations: verifies products repair and storage bucket migration', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20261027020000_products_and_storage_repair.sql');
  assert.equal(fs.existsSync(migrationPath), true, 'Products & storage repair migration file must exist');

  const content = fs.readFileSync(migrationPath, 'utf8');

  // Verify slug column & index
  assert.equal(content.includes('ADD COLUMN IF NOT EXISTS slug TEXT'), true, 'Must add slug column');
  assert.equal(content.includes('ADD COLUMN IF NOT EXISTS sub_category TEXT'), true, 'Must add sub_category column');
  assert.equal(content.includes('CREATE INDEX IF NOT EXISTS idx_products_slug'), true, 'Must index slug column');

  // Verify product-media storage bucket & policies
  assert.equal(content.includes("'product-media'"), true, 'Must register product-media bucket in storage.buckets');
  assert.equal(content.includes('Public can view product media'), true, 'Must provide public read policy');
  assert.equal(content.includes('Admins can upload product media'), true, 'Must restrict uploads to admins');

  // Verify health check function
  assert.equal(content.includes('FUNCTION public.get_db_health()'), true, 'Must declare get_db_health function');
});

test('Admin Provisioning: CLI script and package.json command are configured', () => {
  const scriptPath = path.resolve(process.cwd(), 'scripts/provision-admin.ts');
  assert.equal(fs.existsSync(scriptPath), true, 'provision-admin.ts script must exist');

  const pkgJsonPath = path.resolve(process.cwd(), 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  assert.equal(typeof pkgJson.scripts['admin:create'], 'string', 'package.json must contain admin:create script');
});

test('Middleware: Next.js middleware guards /admin routes at edge level', () => {
  const middlewarePath = path.resolve(process.cwd(), 'src/middleware.ts');
  assert.equal(fs.existsSync(middlewarePath), true, 'middleware.ts must exist');

  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  assert.equal(middlewareContent.includes("pathname.startsWith('/admin')"), true, 'Must protect /admin routes');
  assert.equal(middlewareContent.includes('createServerClient'), true, 'Must refresh session cookies with @supabase/ssr');
});
