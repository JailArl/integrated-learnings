-- Harden StudyPulse daily task integrity before Stripe / production billing

BEGIN;

-- Remove duplicate daily task rows while keeping the newest record per child/date/subject
DELETE FROM sq_daily_tasks a
USING sq_daily_tasks b
WHERE a.id <> b.id
  AND a.child_id = b.child_id
  AND a.task_date = b.task_date
  AND COALESCE(a.subject_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = COALESCE(b.subject_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND (
    a.created_at < b.created_at
    OR (a.created_at = b.created_at AND a.id < b.id)
  );

-- Prevent duplicate rows for the same child/date/subject combination
CREATE UNIQUE INDEX IF NOT EXISTS uq_sq_daily_tasks_child_date_subject
ON sq_daily_tasks (
  child_id,
  task_date,
  COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

COMMIT;
