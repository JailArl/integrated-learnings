-- Migration: Add parent_submissions table for no-auth parent inquiry flow
-- Safe to run multiple times (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS parent_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  student_level TEXT NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  preferred_mode TEXT NOT NULL DEFAULT 'home',
  location TEXT,
  budget_range TEXT,
  current_challenge TEXT,
  goals TEXT,
  preferred_contact_timing TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for admin filtering
CREATE INDEX IF NOT EXISTS idx_parent_submissions_status ON parent_submissions(status);
CREATE INDEX IF NOT EXISTS idx_parent_submissions_created ON parent_submissions(created_at DESC);

-- RLS policies
ALTER TABLE parent_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public inquiry form - no auth required)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'parent_submissions' AND policyname = 'Anyone can submit parent inquiry'
  ) THEN
    CREATE POLICY "Anyone can submit parent inquiry"
      ON parent_submissions FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Only authenticated users (admin) can read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'parent_submissions' AND policyname = 'Admin can view parent submissions'
  ) THEN
    CREATE POLICY "Admin can view parent submissions"
      ON parent_submissions FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Only authenticated users (admin) can update status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'parent_submissions' AND policyname = 'Admin can update parent submissions'
  ) THEN
    CREATE POLICY "Admin can update parent submissions"
      ON parent_submissions FOR UPDATE
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Add tutor onboarding columns to tutor_profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_profiles' AND column_name = 'bio') THEN
    ALTER TABLE tutor_profiles ADD COLUMN bio TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_profiles' AND column_name = 'profile_photo_url') THEN
    ALTER TABLE tutor_profiles ADD COLUMN profile_photo_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_profiles' AND column_name = 'rates') THEN
    ALTER TABLE tutor_profiles ADD COLUMN rates TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_profiles' AND column_name = 'teaching_mode') THEN
    ALTER TABLE tutor_profiles ADD COLUMN teaching_mode TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_profiles' AND column_name = 'travel_locations') THEN
    ALTER TABLE tutor_profiles ADD COLUMN travel_locations TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_profiles' AND column_name = 'profile_status') THEN
    ALTER TABLE tutor_profiles ADD COLUMN profile_status TEXT DEFAULT 'account_created';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE tutor_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add document_type to tutor_certificates if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_certificates' AND column_name = 'document_type') THEN
    ALTER TABLE tutor_certificates ADD COLUMN document_type TEXT DEFAULT 'certificate';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutor_certificates' AND column_name = 'verification_status') THEN
    ALTER TABLE tutor_certificates ADD COLUMN verification_status TEXT DEFAULT 'pending';
  END IF;
END $$;
