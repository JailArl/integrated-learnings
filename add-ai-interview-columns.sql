-- Add AI Interview columns to tutor_profiles table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE tutor_profiles 
ADD COLUMN IF NOT EXISTS ai_interview_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_interview_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_interview_assessment TEXT,
ADD COLUMN IF NOT EXISTS ai_interview_transcript TEXT,
ADD COLUMN IF NOT EXISTS ai_interview_attempts INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tutor_ai_interview_status ON tutor_profiles(ai_interview_status);
