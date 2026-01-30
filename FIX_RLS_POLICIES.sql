-- Fix RLS policies to allow signup flow for both parents and tutors
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own tutor profile" ON tutor_profiles;
DROP POLICY IF EXISTS "Users can insert their own parent profile" ON parent_profiles;

-- Recreate with permissive policies that allow signup
CREATE POLICY "Allow tutor profile creation"
  ON tutor_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow parent profile creation"
  ON parent_profiles FOR INSERT
  WITH CHECK (true);

