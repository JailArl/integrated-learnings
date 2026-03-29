-- ══════════════════════════════════════════════════════════════
-- Classroom Admin Schema — Sub-access codes for part-time instructors
-- Run this in Supabase SQL Editor AFTER game-event-schema.sql
-- ══════════════════════════════════════════════════════════════

-- 1. Add session_mode to game_events (cohort = sync rounds, classroom = per-class rounds)
ALTER TABLE game_events ADD COLUMN IF NOT EXISTS session_mode VARCHAR(20) DEFAULT 'cohort';
-- 'cohort'    = chief controls all rounds globally, all classes start/end together
-- 'classroom' = each class instructor controls rounds independently

-- 2. CLASSROOM CODES: Sub-access codes for part-time instructors
CREATE TABLE IF NOT EXISTS classroom_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES game_events(id) ON DELETE CASCADE,
  class_id VARCHAR(20) NOT NULL,
  sub_code VARCHAR(12) NOT NULL UNIQUE,
  instructor_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_codes_event ON classroom_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_classroom_codes_sub ON classroom_codes(sub_code);

-- 3. CLASS-LEVEL ROUND STATUS: In classroom mode, each class can be at a different round
CREATE TABLE IF NOT EXISTS class_round_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES game_events(id) ON DELETE CASCADE,
  class_id VARCHAR(20) NOT NULL,
  round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  UNIQUE(event_id, class_id, round_id)
);

CREATE INDEX IF NOT EXISTS idx_class_round_event ON class_round_status(event_id);

-- ══════════════════════════════════════════════════════════════
-- GENERATE SUB-CODE FUNCTION
-- Chief instructor calls this to create a classroom sub-code
-- Sub-code format: {EVENT_CODE}-{CLASS_ID} e.g. ABC123-3A
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION create_classroom_code(
  p_event_id UUID,
  p_class_id VARCHAR(20),
  p_instructor_name TEXT DEFAULT NULL
)
RETURNS TABLE(out_sub_code VARCHAR(12), out_class_id VARCHAR(20)) AS $$
DECLARE
  v_event_code VARCHAR(8);
  v_sub_code VARCHAR(12);
BEGIN
  -- Get the event's access code
  SELECT access_code INTO v_event_code FROM game_events WHERE id = p_event_id;
  IF v_event_code IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  -- Build sub-code: EVENT_CODE-CLASS_ID
  v_sub_code := v_event_code || '-' || UPPER(TRIM(p_class_id));

  -- Insert (upsert if class already exists for this event)
  INSERT INTO classroom_codes (event_id, class_id, sub_code, instructor_name)
  VALUES (p_event_id, UPPER(TRIM(p_class_id)), v_sub_code, p_instructor_name)
  ON CONFLICT (event_id, class_id) DO UPDATE SET
    instructor_name = COALESCE(EXCLUDED.instructor_name, classroom_codes.instructor_name),
    is_active = TRUE;

  -- Auto-create class_round_status entries for all existing rounds
  INSERT INTO class_round_status (event_id, class_id, round_id, is_active)
  SELECT p_event_id, UPPER(TRIM(p_class_id)), r.id, FALSE
  FROM game_rounds r WHERE r.event_id = p_event_id
  ON CONFLICT (event_id, class_id, round_id) DO NOTHING;

  RETURN QUERY SELECT v_sub_code, UPPER(TRIM(p_class_id))::VARCHAR(20);
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- VALIDATE CLASSROOM CODE
-- Part-time instructor calls this to log in to classroom admin
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION validate_classroom_code(p_sub_code VARCHAR(12))
RETURNS TABLE(
  event_id UUID,
  school_name TEXT,
  class_id VARCHAR(20),
  instructor_name TEXT,
  is_valid BOOLEAN,
  session_mode VARCHAR(20),
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ge.id,
    ge.school_name,
    cc.class_id,
    cc.instructor_name,
    (ge.is_active AND ge.expires_at > NOW() AND cc.is_active) AS is_valid,
    ge.session_mode,
    ge.expires_at
  FROM classroom_codes cc
  JOIN game_events ge ON ge.id = cc.event_id
  WHERE UPPER(cc.sub_code) = UPPER(p_sub_code)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- ACTIVATE CLASS ROUND (classroom mode only)
-- Instructor activates a round for their class only
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION activate_class_round(
  p_event_id UUID,
  p_class_id VARCHAR(20),
  p_round_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Deactivate all rounds for this class
  UPDATE class_round_status SET is_active = FALSE, ended_at = NOW()
  WHERE event_id = p_event_id AND class_id = UPPER(TRIM(p_class_id)) AND is_active = TRUE;

  -- Activate the selected round
  UPDATE class_round_status SET is_active = TRUE, started_at = NOW(), ended_at = NULL
  WHERE event_id = p_event_id AND class_id = UPPER(TRIM(p_class_id)) AND round_id = p_round_id;

  -- If no row was updated (missing entry), insert it
  IF NOT FOUND THEN
    INSERT INTO class_round_status (event_id, class_id, round_id, is_active, started_at)
    VALUES (p_event_id, UPPER(TRIM(p_class_id)), p_round_id, TRUE, NOW())
    ON CONFLICT (event_id, class_id, round_id) DO UPDATE SET is_active = TRUE, started_at = NOW(), ended_at = NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- END CLASS ROUND (classroom mode only)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION end_class_round(
  p_event_id UUID,
  p_class_id VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
  UPDATE class_round_status SET is_active = FALSE, ended_at = NOW()
  WHERE event_id = p_event_id AND class_id = UPPER(TRIM(p_class_id)) AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- RLS POLICIES — classroom_codes
-- ══════════════════════════════════════════════════════════════
ALTER TABLE classroom_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classroom_codes_public_read" ON classroom_codes FOR SELECT USING (true);
CREATE POLICY "classroom_codes_public_insert" ON classroom_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "classroom_codes_public_update" ON classroom_codes FOR UPDATE USING (true);
CREATE POLICY "classroom_codes_public_delete" ON classroom_codes FOR DELETE USING (true);

ALTER TABLE class_round_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class_round_status_public_read" ON class_round_status FOR SELECT USING (true);
CREATE POLICY "class_round_status_public_insert" ON class_round_status FOR INSERT WITH CHECK (true);
CREATE POLICY "class_round_status_public_update" ON class_round_status FOR UPDATE USING (true);
CREATE POLICY "class_round_status_public_delete" ON class_round_status FOR DELETE USING (true);
