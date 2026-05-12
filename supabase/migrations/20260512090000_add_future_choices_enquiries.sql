-- Migration: Add future_choices_enquiries table for June holiday workshop enquiries
-- Safe to run multiple times (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS future_choices_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  student_level TEXT NOT NULL,
  workshop_option TEXT NOT NULL,
  additional_notes TEXT,
  source_path TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_future_choices_enquiries_status ON future_choices_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_future_choices_enquiries_created ON future_choices_enquiries(created_at DESC);

ALTER TABLE future_choices_enquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'future_choices_enquiries' AND policyname = 'Anyone can submit future choices enquiry'
  ) THEN
    CREATE POLICY "Anyone can submit future choices enquiry"
      ON future_choices_enquiries FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'future_choices_enquiries' AND policyname = 'Admin can view future choices enquiries'
  ) THEN
    CREATE POLICY "Admin can view future choices enquiries"
      ON future_choices_enquiries FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'future_choices_enquiries' AND policyname = 'Admin can update future choices enquiries'
  ) THEN
    CREATE POLICY "Admin can update future choices enquiries"
      ON future_choices_enquiries FOR UPDATE
      USING (auth.role() = 'authenticated');
  END IF;
END $$;