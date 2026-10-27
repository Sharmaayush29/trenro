/**
 * Supabase Environment Configuration Verification
 * Strictly verifies whether real valid Supabase credentials have been configured.
 */

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes('your-project-id') || anonKey.includes('your-anon-key')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export function isServiceRoleConfigured(): boolean {
  if (!isSupabaseConfigured()) return false;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return false;
  if (serviceKey.includes('your-service-role-key')) return false;
  return serviceKey.trim().length > 20;
}
