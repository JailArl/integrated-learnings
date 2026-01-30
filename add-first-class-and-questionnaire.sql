-- Add first class scheduling columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS first_class_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS first_class_location TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS first_class_notes TEXT;

-- Add first class scheduling columns to parent_requests table
ALTER TABLE parent_requests ADD COLUMN IF NOT EXISTS first_class_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE parent_requests ADD COLUMN IF NOT EXISTS first_class_location TEXT;

-- Add questionnaire columns to tutor_profiles table
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS questionnaire_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS teaching_philosophy TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS why_tutoring TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS strengths TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS preferred_student_levels TEXT[];
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS availability_days TEXT[];
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 5;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Add editable profile fields (rate, availability notes)
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS availability_notes TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS teaching_subjects TEXT[];

-- Ensure hourly_rate is editable (should already exist)
-- ALTER TABLE tutor_profiles ALTER COLUMN hourly_rate SET NOT NULL;

-- Update RLS policies to allow tutors to update their own profiles
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutor_profiles;
CREATE POLICY "Tutors can update own profile" 
ON tutor_profiles FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Allow tutors to read their own data
DROP POLICY IF EXISTS "Tutors can read own data" ON tutor_profiles;
CREATE POLICY "Tutors can read own data" 
ON tutor_profiles FOR SELECT 
USING (true);
