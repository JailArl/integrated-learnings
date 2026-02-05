-- WhatsApp Contact Management System
-- Tracks parent contacts and their engagement stage in the system

-- 1. Create WhatsApp Contacts Table
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  contact_status TEXT DEFAULT 'new',
  parent_id UUID,
  first_message_date TIMESTAMP DEFAULT NOW(),
  last_message_date TIMESTAMP DEFAULT NOW(),
  first_message_content TEXT,
  message_count INTEGER DEFAULT 1,
  ai_responses_sent INTEGER DEFAULT 0,
  case_request_id UUID,
  has_submitted_enquiry BOOLEAN DEFAULT false,
  has_booked_diagnostic BOOLEAN DEFAULT false,
  has_active_case BOOLEAN DEFAULT false,
  preferred_subject TEXT,
  student_level TEXT,
  conversion_stage TEXT,
  last_ai_response_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create WhatsApp Conversation History
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  content TEXT NOT NULL,
  intent TEXT,
  detected_intent_confidence NUMERIC(3,2),
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,
  metadata JSONB,
  message_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create WhatsApp Templates
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL,
  contact_stage TEXT,
  message_text TEXT NOT NULL,
  requires_personalization BOOLEAN DEFAULT false,
  personalization_fields TEXT,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_message_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow admins to view all WhatsApp contacts
CREATE POLICY "Admins can view all whatsapp contacts"
  ON whatsapp_contacts FOR SELECT
  USING (true);

-- Allow admins to update contacts
CREATE POLICY "Admins can update whatsapp contacts"
  ON whatsapp_contacts FOR UPDATE
  USING (true);

-- Conversations - similar policies
CREATE POLICY "Admins can view all conversations"
  ON whatsapp_conversations FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert conversations"
  ON whatsapp_conversations FOR INSERT
  WITH CHECK (true);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone ON whatsapp_contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_status ON whatsapp_contacts(contact_status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_stage ON whatsapp_contacts(conversion_stage);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_contact ON whatsapp_conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_intent ON whatsapp_conversations(intent);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_timestamp ON whatsapp_conversations(message_timestamp DESC);

-- Insert Default Message Templates
INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, ai_generated)
VALUES
  (
    'welcome_new_contact',
    'welcome',
    'new',
    'Hi! 👋 Welcome to integrated-learnings! I''m here to help you find the perfect tutor for your child. How can I assist you today?' || E'\n' || E'\n' || 'Reply with: 📚 TUTORS, 💰 PRICING, ❓ HELP, 📝 REQUEST',
    false,
    false
  ),
  (
    'question_response_tutors',
    'question_response',
    'conversational',
    'Great! We have over 100+ verified tutors across all subjects. What subject are you looking for? (Math, English, Science, etc.)',
    true,
    false
  ),
  (
    'case_summary',
    'case_summary',
    'detailed_inquiry',
    'Perfect! I''ve recorded your enquiry: 📚 Subject: {subject}, 👨‍🎓 Level: {level}, 📍 Location: {location}. Our tutors will start bidding to teach your child!',
    true,
    false
  );
