-- Phase 1: Database Updates for Tutor Onboarding
-- Run this in Supabase SQL Editor

-- 1. Add new columns to tutor_profiles table
ALTER TABLE tutor_profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_verification_status TEXT DEFAULT 'missing',
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS cert_verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_interview_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_interview_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_interview_transcript TEXT,
ADD COLUMN IF NOT EXISTS ai_interview_assessment TEXT,
ADD COLUMN IF NOT EXISTS can_access_cases BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ranking_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_ranking_assessment TEXT,
ADD COLUMN IF NOT EXISTS response_time_avg INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ranking_updated_at TIMESTAMP;

-- 2. Create certificates table for multiple cert uploads
CREATE TABLE IF NOT EXISTS tutor_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verification_status TEXT DEFAULT 'pending',
  verified_by UUID REFERENCES admin_users(id),
  verified_at TIMESTAMP,
  admin_notes TEXT
);

-- 3. Enable RLS on certificates table
ALTER TABLE tutor_certificates ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for certificates
CREATE POLICY "Tutors can view own certificates"
  ON tutor_certificates FOR SELECT
  USING (tutor_id = auth.uid());

CREATE POLICY "Tutors can insert own certificates"
  ON tutor_certificates FOR INSERT
  WITH CHECK (tutor_id = auth.uid());

CREATE POLICY "Admins can view all certificates"
  ON tutor_certificates FOR SELECT
  USING (true);

CREATE POLICY "Admins can update all certificates"
  ON tutor_certificates FOR UPDATE
  USING (true);

-- 5. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tutor_certificates_tutor_id ON tutor_certificates(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_certificates_status ON tutor_certificates(verification_status);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_ranking ON tutor_profiles(ranking_score DESC NULLS LAST);

-- 6. Update existing tutors to have default onboarding status
UPDATE tutor_profiles 
SET onboarding_status = 'pending',
    can_access_cases = false
WHERE onboarding_status IS NULL;

-- NOTE: You also need to create a Storage Bucket in Supabase:
-- 1. Go to Storage in Supabase dashboard
-- 2. Create a new bucket called: tutor-uploads
-- 3. Set it to PUBLIC so photos can be displayed
-- 4. Set max file size to 5MB
