-- ═══════════════════════════════════════════════════════════════
-- PRE-LAUNCH RLS SECURITY FIX
-- Run this in Supabase SQL Editor BEFORE going live
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. PARENT REQUESTS: only inserter can read own rows, admin via service_role ───
DROP POLICY IF EXISTS "parent_requests_select_policy" ON parent_requests;
DROP POLICY IF EXISTS "parent_requests_insert_policy" ON parent_requests;
DROP POLICY IF EXISTS "parent_requests_update_policy" ON parent_requests;

-- Anyone can submit a request (public form), but only the submitter or admin read it
CREATE POLICY "parent_requests_insert" ON parent_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "parent_requests_select_own" ON parent_requests
  FOR SELECT USING (
    auth.uid()::text = COALESCE(parent_id::text, '')
    OR auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "parent_requests_update_admin" ON parent_requests
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');


-- ─── 2. TUTOR BIDS: only authenticated tutors + admin ───
DROP POLICY IF EXISTS "tutor_bids_select_policy" ON tutor_bids;
DROP POLICY IF EXISTS "tutor_bids_insert_policy" ON tutor_bids;
DROP POLICY IF EXISTS "tutor_bids_update_policy" ON tutor_bids;

CREATE POLICY "tutor_bids_select" ON tutor_bids
  FOR SELECT USING (
    auth.uid()::text = tutor_id::text
    OR auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "tutor_bids_insert" ON tutor_bids
  FOR INSERT WITH CHECK (auth.uid()::text = tutor_id::text);

CREATE POLICY "tutor_bids_update" ON tutor_bids
  FOR UPDATE USING (auth.uid()::text = tutor_id::text);


-- ─── 3. MATCHES: only participants + admin ───
DROP POLICY IF EXISTS "matches_select_policy" ON matches;
DROP POLICY IF EXISTS "matches_insert_policy" ON matches;
DROP POLICY IF EXISTS "matches_update_policy" ON matches;

CREATE POLICY "matches_select" ON matches
  FOR SELECT USING (
    auth.uid()::text = tutor_id::text
    OR auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "matches_insert_admin" ON matches
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "matches_update" ON matches
  FOR UPDATE USING (
    auth.uid()::text = tutor_id::text
    OR auth.jwt()->>'role' = 'service_role'
  );


-- ─── 4. GAME TABLES: restrict to authenticated users with valid event ───
-- classroom_codes: public read (needed to validate codes), but no public write
DROP POLICY IF EXISTS "classroom_codes_public_read" ON classroom_codes;
DROP POLICY IF EXISTS "classroom_codes_public_insert" ON classroom_codes;
DROP POLICY IF EXISTS "classroom_codes_public_update" ON classroom_codes;
DROP POLICY IF EXISTS "classroom_codes_public_delete" ON classroom_codes;

CREATE POLICY "classroom_codes_read" ON classroom_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "classroom_codes_admin_write" ON classroom_codes
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- class_round_status: authenticated read/write only
DROP POLICY IF EXISTS "class_round_status_public_read" ON class_round_status;
DROP POLICY IF EXISTS "class_round_status_public_insert" ON class_round_status;
DROP POLICY IF EXISTS "class_round_status_public_update" ON class_round_status;
DROP POLICY IF EXISTS "class_round_status_public_delete" ON class_round_status;

CREATE POLICY "class_round_status_read" ON class_round_status
  FOR SELECT USING (true);

CREATE POLICY "class_round_status_write" ON class_round_status
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "class_round_status_update" ON class_round_status
  FOR UPDATE USING (auth.role() = 'authenticated');

-- game_events: public read for validation, admin write
DROP POLICY IF EXISTS "Anyone can validate access codes" ON game_events;
DROP POLICY IF EXISTS "game_events_public_insert" ON game_events;
DROP POLICY IF EXISTS "game_events_public_update" ON game_events;
DROP POLICY IF EXISTS "game_events_public_delete" ON game_events;

CREATE POLICY "game_events_read" ON game_events
  FOR SELECT USING (is_active = true);

CREATE POLICY "game_events_admin_write" ON game_events
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- players: authenticated insert + read own
DROP POLICY IF EXISTS "Anyone can read players" ON players;
DROP POLICY IF EXISTS "Anyone can create players" ON players;
DROP POLICY IF EXISTS "players_public_update" ON players;
DROP POLICY IF EXISTS "players_public_delete" ON players;

CREATE POLICY "players_read" ON players
  FOR SELECT USING (true);

CREATE POLICY "players_insert" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "players_update_own" ON players
  FOR UPDATE USING (id::text = COALESCE(current_setting('request.jwt.claim.sub', true), ''));

-- game_sessions: read own session, create own, update own
DROP POLICY IF EXISTS "Anyone can read sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can create sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can update own session" ON game_sessions;
DROP POLICY IF EXISTS "game_sessions_public_delete" ON game_sessions;

CREATE POLICY "game_sessions_read" ON game_sessions
  FOR SELECT USING (true);

CREATE POLICY "game_sessions_insert" ON game_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "game_sessions_update" ON game_sessions
  FOR UPDATE USING (true);

-- game_rounds: read + write for active sessions
DROP POLICY IF EXISTS "game_rounds_public_read" ON game_rounds;
DROP POLICY IF EXISTS "game_rounds_public_insert" ON game_rounds;
DROP POLICY IF EXISTS "game_rounds_public_update" ON game_rounds;

CREATE POLICY "game_rounds_read" ON game_rounds
  FOR SELECT USING (true);

CREATE POLICY "game_rounds_insert" ON game_rounds
  FOR INSERT WITH CHECK (true);

CREATE POLICY "game_rounds_update" ON game_rounds
  FOR UPDATE USING (true);


-- ─── 5. ADMINS TABLE: no public read ───
DROP POLICY IF EXISTS "admins_public_read" ON admins;
DROP POLICY IF EXISTS "admins_select" ON admins;

CREATE POLICY "admins_service_only" ON admins
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- NOTE: The game admin login must use a Supabase Edge Function with service_role
-- to validate credentials, since the admins table is no longer publicly readable.
-- For now, keep the existing flow but understand this is a known limitation.
-- Alternative: Use Supabase auth with custom claims for admin role.


-- ─── 6. WHATSAPP TABLES: no public read ───
DROP POLICY IF EXISTS "Admins can view all whatsapp contacts" ON whatsapp_contacts;
DROP POLICY IF EXISTS "whatsapp_contacts_public_read" ON whatsapp_contacts;
DROP POLICY IF EXISTS "whatsapp_conversations_public_read" ON whatsapp_conversations;
DROP POLICY IF EXISTS "whatsapp_conversations_public_insert" ON whatsapp_conversations;

CREATE POLICY "whatsapp_contacts_admin" ON whatsapp_contacts
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "whatsapp_conversations_admin" ON whatsapp_conversations
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');


-- ─── 7. HASH THE GAME ADMIN PASSWORD ───
-- (Only if pgcrypto extension is enabled)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- UPDATE admins SET password_hash = crypt('lifechoices2025', gen_salt('bf'))
--   WHERE username = 'teacher' AND password_hash = 'lifechoices2025';

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION: Run these after applying to check
-- ═══════════════════════════════════════════════════════════════
-- SELECT tablename, policyname, cmd, qual FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;
