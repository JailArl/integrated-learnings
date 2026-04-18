-- Harden admin authentication tables for production launch.
-- Apply in Supabase SQL Editor.

BEGIN;

ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select_own" ON admin_users;
DROP POLICY IF EXISTS "admin_sessions_select_own" ON admin_sessions;
DROP POLICY IF EXISTS "admin_users_service_role_only" ON admin_users;
DROP POLICY IF EXISTS "admin_sessions_service_role_only" ON admin_sessions;

-- Restrict all direct table access to service_role only.
CREATE POLICY "admin_users_service_role_only" ON admin_users
  FOR ALL USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "admin_sessions_service_role_only" ON admin_sessions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

COMMIT;
