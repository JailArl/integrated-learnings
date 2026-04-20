-- ── sq_outbound_queue ────────────────────────────────────────────────────
-- Centralised queue for ALL business-initiated outbound WhatsApp sends.
-- Both the cron and the webhook INSERT here; only processOutboundQueue()
-- (called at the end of every cron run) actually calls send-whatsapp.
--
-- Constraint: UNIQUE(idempotency_key) — INSERT … ON CONFLICT DO NOTHING
-- makes every enqueue call inherently idempotent.
--
-- RLS: service_role only (no user-level access).
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sq_outbound_queue (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key  TEXT NOT NULL UNIQUE,      -- deterministic key: {job_type}:{scope_id}:{date_or_week}
  to_phone         TEXT NOT NULL,
  message_type     TEXT NOT NULL CHECK (message_type IN ('raw', 'template', 'content_sid')),
  template_name    TEXT,                      -- for message_type = 'template'
  content_sid      TEXT,                      -- for message_type = 'content_sid' (Phase 2 approved templates)
  variables        JSONB,                     -- template variables
  raw_body         TEXT,                      -- for message_type = 'raw'
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  attempts         INT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error       TEXT,
  scheduled_for    TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at          TIMESTAMPTZ,
  context_label    TEXT,                      -- e.g. 'parent-notification', 'weekly-summary', 'exam-warning'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for the queue processor (drain pending in order)
CREATE INDEX IF NOT EXISTS idx_sq_outbound_queue_pending
  ON sq_outbound_queue (status, scheduled_for, attempts)
  WHERE status = 'pending';

-- Index for the admin Failed Messages tab
CREATE INDEX IF NOT EXISTS idx_sq_outbound_queue_failed
  ON sq_outbound_queue (status, created_at DESC)
  WHERE status = 'failed';

-- RLS: service_role only — no anon/authenticated access.
ALTER TABLE sq_outbound_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sq_outbound_queue_service_role_only" ON sq_outbound_queue;
CREATE POLICY "sq_outbound_queue_service_role_only" ON sq_outbound_queue
  FOR ALL USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE sq_outbound_queue IS 'Centralised outbound WhatsApp message queue. The cron drains this table via processOutboundQueue() at the end of each run. Unique idempotency_key prevents duplicate sends.';

-- ── Add twilio_content_sid column to whatsapp_message_templates ──────────
-- Phase 2 will populate these with approved Meta template SIDs.
-- NULL = not yet registered / use raw_body for now.
ALTER TABLE whatsapp_message_templates
  ADD COLUMN IF NOT EXISTS twilio_content_sid TEXT DEFAULT NULL;

COMMENT ON COLUMN whatsapp_message_templates.twilio_content_sid IS 'Twilio ContentSid for the Meta-approved WhatsApp template. NULL until registered in Phase 2.';
