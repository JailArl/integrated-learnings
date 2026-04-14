-- Anti-sharing / anti-abuse guardrails for StudyPulse parent accounts
-- Run in Supabase SQL editor before enabling Stripe billing

BEGIN;

-- Normalize empty strings
UPDATE sq_memberships SET parent_phone = NULL WHERE parent_phone = '';
UPDATE sq_children SET whatsapp_number = NULL WHERE whatsapp_number = '';

-- Prevent the same parent WhatsApp number from being used across multiple memberships
CREATE UNIQUE INDEX IF NOT EXISTS uq_sq_memberships_parent_phone_normalized
ON sq_memberships ((regexp_replace(parent_phone, '[^0-9+]', '', 'g')))
WHERE parent_phone IS NOT NULL;

-- Prevent the same child WhatsApp number from being attached to multiple accounts
CREATE UNIQUE INDEX IF NOT EXISTS uq_sq_children_whatsapp_normalized
ON sq_children ((regexp_replace(whatsapp_number, '[^0-9+]', '', 'g')))
WHERE whatsapp_number IS NOT NULL;

COMMIT;
