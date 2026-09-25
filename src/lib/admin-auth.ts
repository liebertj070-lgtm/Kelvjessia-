// Staff access for /admin. Real access now comes from profiles.role
// (dispatcher/admin) — see supabase/schema.sql — checked by
// admin/layout.tsx via is_staff() through RLS. ADMIN_EMAILS stays as a
// bootstrap allowlist only, so whoever set this up isn't locked out of
// their own dashboard before they've promoted any profiles.role to
// 'dispatcher' or 'admin' (e.g. via the Supabase SQL editor:
// `update profiles set role = 'admin' where id = '<your user id>';`).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isStaffRole(role: string | null | undefined): boolean {
  return role === "dispatcher" || role === "admin";
}
