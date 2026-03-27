-- ══════════════════════════════════════════════════════════════
-- Life Choices Game — Event Session Schema
-- Run this in Supabase SQL Editor to set up the game tables
-- ══════════════════════════════════════════════════════════════

-- 1. EVENT SESSIONS: Each school visit gets a temp access code
CREATE TABLE IF NOT EXISTS game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code VARCHAR(8) NOT NULL UNIQUE,
  school_name TEXT NOT NULL,
  teacher_name TEXT,
  teacher_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  -- Auto-generated rounds for the event (JSON array of round configs)
  round_config JSONB DEFAULT '[]'::jsonb
);

-- Index for fast access code lookup
CREATE INDEX IF NOT EXISTS idx_game_events_code ON game_events(access_code);
CREATE INDEX IF NOT EXISTS idx_game_events_expires ON game_events(expires_at);

-- 2. GAME ROUNDS: Each event has multiple rounds with different targets
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES game_events(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL,
  round_number INT DEFAULT 1,
  goal TEXT NOT NULL DEFAULT 'combined',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  time_limit_minutes INT DEFAULT 30
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_event ON game_rounds(event_id);

-- 3. PLAYERS: Students identified by class + index within an event
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES game_events(id) ON DELETE CASCADE,
  class_id VARCHAR(20) NOT NULL,
  index_number VARCHAR(10) NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, class_id, index_number)
);

CREATE INDEX IF NOT EXISTS idx_players_event ON players(event_id);

-- 4. GAME SESSIONS: One per player per round
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
  event_id UUID REFERENCES game_events(id) ON DELETE CASCADE,
  age INT DEFAULT 17,
  cash NUMERIC DEFAULT 500,
  cpf NUMERIC DEFAULT 0,
  happiness INT DEFAULT 50,
  net_worth NUMERIC DEFAULT 500,
  final_score NUMERIC DEFAULT 0,
  ff_age INT,
  is_complete BOOLEAN DEFAULT FALSE,
  game_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(player_id, round_id)
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_round ON game_sessions(round_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_event ON game_sessions(event_id);

-- 5. ADMINS: Teacher/admin accounts (simple for now)
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin (change password after first login!)
INSERT INTO admins (username, password_hash)
VALUES ('teacher', 'lifechoices2025')
ON CONFLICT (username) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- ACCESS CODE GENERATION FUNCTION
-- Generates a random 6-char alphanumeric code (uppercase, no confusing chars)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- No 0,O,1,I to avoid confusion
  code TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- CREATE EVENT FUNCTION
-- Teacher calls this to generate a new event with access code + preset rounds
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION create_game_event(
  p_school_name TEXT,
  p_teacher_name TEXT DEFAULT NULL,
  p_teacher_email TEXT DEFAULT NULL,
  p_hours INT DEFAULT 48,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(event_id UUID, access_code VARCHAR(8), expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_code VARCHAR(8);
  v_event_id UUID;
  v_expires TIMESTAMPTZ;
  v_attempt INT := 0;
BEGIN
  v_expires := NOW() + (p_hours || ' hours')::INTERVAL;

  -- Generate unique code (retry if collision)
  LOOP
    v_code := generate_access_code();
    v_attempt := v_attempt + 1;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM game_events WHERE game_events.access_code = v_code);
    EXIT WHEN v_attempt > 10;
  END LOOP;

  -- Create the event
  INSERT INTO game_events (access_code, school_name, teacher_name, teacher_email, expires_at, notes)
  VALUES (v_code, p_school_name, p_teacher_name, p_teacher_email, v_expires, p_notes)
  RETURNING game_events.id INTO v_event_id;

  -- Auto-create 5 preset rounds for the event
  INSERT INTO game_rounds (event_id, round_name, round_number, goal, time_limit_minutes) VALUES
    (v_event_id, '🏁 Race to Financial Freedom', 1, 'ff_earliest', 25),
    (v_event_id, '💰 Highest Net Worth', 2, 'highest_nw', 25),
    (v_event_id, '😊 Happiest Life', 3, 'highest_hi', 25),
    (v_event_id, '🏛️ Best Retirement Fund', 4, 'highest_cpf', 25),
    (v_event_id, '⚖️ Most Balanced Life', 5, 'balanced_life', 25);

  RETURN QUERY SELECT v_event_id, v_code, v_expires;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- VALIDATE ACCESS CODE FUNCTION
-- Students call this to check if their code is valid + not expired
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION validate_access_code(p_code VARCHAR(8))
RETURNS TABLE(event_id UUID, school_name TEXT, is_valid BOOLEAN, expires_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ge.id,
    ge.school_name,
    (ge.is_active AND ge.expires_at > NOW()) AS is_valid,
    ge.expires_at
  FROM game_events ge
  WHERE UPPER(ge.access_code) = UPPER(p_code)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- AUTO-DEACTIVATE EXPIRED EVENTS (run via pg_cron or Supabase Edge Function)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION deactivate_expired_events()
RETURNS INT AS $$
DECLARE
  affected INT;
BEGIN
  UPDATE game_events SET is_active = FALSE
  WHERE is_active = TRUE AND expires_at < NOW();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- EXPORT EVENT DATA (returns full report as JSON for a given event)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION export_event_report(p_event_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'event', (SELECT row_to_json(e) FROM game_events e WHERE e.id = p_event_id),
    'rounds', (
      SELECT COALESCE(jsonb_agg(row_to_json(r) ORDER BY r.round_number), '[]'::jsonb)
      FROM game_rounds r WHERE r.event_id = p_event_id
    ),
    'players', (
      SELECT COALESCE(jsonb_agg(row_to_json(p)), '[]'::jsonb)
      FROM players p WHERE p.event_id = p_event_id
    ),
    'sessions', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'player_id', s.player_id,
          'player_class', p2.class_id,
          'player_index', p2.index_number,
          'round_id', s.round_id,
          'round_name', r2.round_name,
          'round_goal', r2.goal,
          'age', s.age,
          'cash', s.cash,
          'cpf', s.cpf,
          'happiness', s.happiness,
          'net_worth', s.net_worth,
          'final_score', s.final_score,
          'ff_age', s.ff_age,
          'is_complete', s.is_complete,
          'game_state', s.game_state
        ) ORDER BY r2.round_number, s.final_score DESC
      ), '[]'::jsonb)
      FROM game_sessions s
      JOIN players p2 ON p2.id = s.player_id
      JOIN game_rounds r2 ON r2.id = s.round_id
      WHERE s.event_id = p_event_id
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- CLEANUP: Delete event data after export (or after expiry)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION cleanup_event(p_event_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- CASCADE will delete rounds, players, sessions
  DELETE FROM game_events WHERE id = p_event_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow anon (game client) to read events, rounds; insert/update players & sessions
CREATE POLICY "Anyone can validate access codes" ON game_events FOR SELECT USING (true);
CREATE POLICY "Anyone can read rounds" ON game_rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can create players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own session" ON game_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can read admins" ON admins FOR SELECT USING (true);

-- Admin can do everything
CREATE POLICY "Admin full access events" ON game_events FOR ALL USING (true);
CREATE POLICY "Admin full access rounds" ON game_rounds FOR ALL USING (true);
CREATE POLICY "Admin full access sessions" ON game_sessions FOR ALL USING (true);
