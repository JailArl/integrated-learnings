-- Comprehensive RLS Policy Fix for All Tables

-- ============================================================================
-- PARENT_REQUESTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "parent_requests_select_policy" ON parent_requests;
DROP POLICY IF EXISTS "parent_requests_insert_policy" ON parent_requests;
DROP POLICY IF EXISTS "parent_requests_update_policy" ON parent_requests;

-- Allow anyone to read parent requests (tutors need to see available cases, admins need to see all)
CREATE POLICY "parent_requests_select_policy" ON parent_requests
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert (parents creating requests)
CREATE POLICY "parent_requests_insert_policy" ON parent_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow updates from anyone (admin needs to update status to 'matched')
CREATE POLICY "parent_requests_update_policy" ON parent_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

ALTER TABLE parent_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TUTOR_BIDS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "tutor_bids_select_policy" ON tutor_bids;
DROP POLICY IF EXISTS "tutor_bids_insert_policy" ON tutor_bids;

-- Allow anyone to read bids (admins need to see bids for approval)
CREATE POLICY "tutor_bids_select_policy" ON tutor_bids
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert (tutors submitting bids)
CREATE POLICY "tutor_bids_insert_policy" ON tutor_bids
  FOR INSERT
  WITH CHECK (true);

ALTER TABLE tutor_bids ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MATCHES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "matches_select_policy" ON matches;
DROP POLICY IF EXISTS "matches_insert_policy" ON matches;
DROP POLICY IF EXISTS "matches_update_policy" ON matches;

-- Allow anyone to read matches (tutors and parents need to see their matches)
CREATE POLICY "matches_select_policy" ON matches
  FOR SELECT
  USING (true);

-- Allow inserts (for admin approval)
CREATE POLICY "matches_insert_policy" ON matches
  FOR INSERT
  WITH CHECK (true);

-- Allow updates
CREATE POLICY "matches_update_policy" ON matches
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
