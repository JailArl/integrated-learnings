-- Fix StudyPulse excused days so they save correctly and appear on the weekly calendar

BEGIN;

-- 1) Allow all statuses used by the app
ALTER TABLE sq_checkins DROP CONSTRAINT IF EXISTS sq_checkins_status_check;
ALTER TABLE sq_checkins
  ADD CONSTRAINT sq_checkins_status_check
  CHECK (status IN ('pending', 'yes', 'partially', 'no', 'forgot', 'excused'));

-- 2) Remove duplicate rows so one child has only one check-in per day
DELETE FROM sq_checkins a
USING sq_checkins b
WHERE a.child_id = b.child_id
  AND a.checkin_date = b.checkin_date
  AND (
    a.created_at < b.created_at
    OR (a.created_at = b.created_at AND a.id < b.id)
  );

-- 3) Enforce the uniqueness expected by the app's upsert logic
CREATE UNIQUE INDEX IF NOT EXISTS uq_sq_checkins_child_date
  ON sq_checkins(child_id, checkin_date);

COMMIT;
