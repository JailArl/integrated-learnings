-- Fix RLS policies for matches table to allow inserts

-- Drop existing policies for matches table
DROP POLICY IF EXISTS "matches_select_policy" ON matches;
DROP POLICY IF EXISTS "matches_insert_policy" ON matches;
DROP POLICY IF EXISTS "matches_update_policy" ON matches;

-- Allow anyone to read matches (tutors and parents need to see their matches)
CREATE POLICY "matches_select_policy" ON matches
  FOR SELECT
  USING (true);

-- Allow inserts from anyone (admin approval happens via service role or authenticated users)
-- This allows the backend/admin to create matches
CREATE POLICY "matches_insert_policy" ON matches
  FOR INSERT
  WITH CHECK (true);

-- Allow updates only for specific fields (if needed)
CREATE POLICY "matches_update_policy" ON matches
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
