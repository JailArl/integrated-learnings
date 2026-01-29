-- Complete Tuition Matching Platform Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Parent users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS parent_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tutor users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS tutor_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  qualification TEXT,
  experience_years INTEGER,
  subjects TEXT[],
  levels TEXT[],
  hourly_rate INTEGER,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  questionnaire_answers JSONB, -- Store teaching style, character assessment
  created_at TIMESTAMP DEFAULT NOW()
);

-- Certificate uploads
CREATE TABLE IF NOT EXISTS tutor_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES tutor_profiles,
  file_url TEXT NOT NULL,
  file_name TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT false
);

-- Parent requests (with diagnostic test)
CREATE TABLE IF NOT EXISTS parent_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES parent_profiles,
  student_name TEXT NOT NULL,
  student_level TEXT NOT NULL,
  subjects TEXT[],
  address TEXT,
  postal_code TEXT,
  diagnostic_test_booked BOOLEAN DEFAULT false,
  diagnostic_test_date TIMESTAMP,
  diagnostic_test_completed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending', -- pending, test_booked, test_completed, matched, invoiced
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tutor bids on cases
CREATE TABLE IF NOT EXISTS tutor_bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES tutor_profiles,
  request_id UUID REFERENCES parent_requests,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tutor_id, request_id) -- Prevent duplicate bids
);

-- Matches (admin approved)
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES parent_requests,
  tutor_id UUID REFERENCES tutor_profiles,
  approved_by TEXT DEFAULT 'admin',
  invoice_generated BOOLEAN DEFAULT false,
  invoice_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_profiles
CREATE POLICY "Users can view their own parent profile"
  ON parent_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own parent profile"
  ON parent_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own parent profile"
  ON parent_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for tutor_profiles
CREATE POLICY "Users can view their own tutor profile"
  ON tutor_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own tutor profile"
  ON tutor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own tutor profile"
  ON tutor_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can view all tutor profiles (for verification)
CREATE POLICY "Admin can view all tutor profiles"
  ON tutor_profiles FOR SELECT
  USING (true);

-- RLS Policies for tutor_certificates
CREATE POLICY "Tutors can view their own certificates"
  ON tutor_certificates FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can insert their own certificates"
  ON tutor_certificates FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Admin can view all certificates"
  ON tutor_certificates FOR SELECT
  USING (true);

-- RLS Policies for parent_requests
CREATE POLICY "Parents can view their own requests"
  ON parent_requests FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own requests"
  ON parent_requests FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Tutors can view requests that are open"
  ON parent_requests FOR SELECT
  USING (status IN ('pending', 'test_booked', 'test_completed'));

CREATE POLICY "Admin can view all requests"
  ON parent_requests FOR SELECT
  USING (true);

-- RLS Policies for tutor_bids
CREATE POLICY "Tutors can view their own bids"
  ON tutor_bids FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can insert their own bids"
  ON tutor_bids FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Admin can view all bids"
  ON tutor_bids FOR SELECT
  USING (true);

-- RLS Policies for matches
CREATE POLICY "Parents can view their matches"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_requests
      WHERE parent_requests.id = matches.request_id
      AND parent_requests.parent_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can view their matches"
  ON matches FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Admin can view all matches"
  ON matches FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parent_requests_parent_id ON parent_requests(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_requests_status ON parent_requests(status);
CREATE INDEX IF NOT EXISTS idx_tutor_bids_tutor_id ON tutor_bids(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_bids_request_id ON tutor_bids(request_id);
CREATE INDEX IF NOT EXISTS idx_matches_request_id ON matches(request_id);
CREATE INDEX IF NOT EXISTS idx_matches_tutor_id ON matches(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_certificates_tutor_id ON tutor_certificates(tutor_id);

-- Note: Remember to create Storage buckets in Supabase dashboard:
-- 1. tutor-certificates (public read, authenticated write)
-- 2. invoices (private, specific read policies)
