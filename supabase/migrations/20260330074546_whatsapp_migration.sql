-- ═══════════════════════════════════════════════════════════════
-- WHATSAPP SCHEMA MIGRATION: Add columns needed by webhook
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add missing columns to whatsapp_conversations
ALTER TABLE whatsapp_conversations ALTER COLUMN contact_id DROP NOT NULL;
ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS direction TEXT;       -- 'inbound' or 'outbound'
ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS message_text TEXT;
ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS twilio_sid TEXT;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON whatsapp_conversations(contact_phone);
CREATE INDEX IF NOT EXISTS idx_wa_conv_twilio_sid ON whatsapp_conversations(twilio_sid);

-- Make content column nullable (webhook uses message_text instead)
ALTER TABLE whatsapp_conversations ALTER COLUMN content DROP NOT NULL;
