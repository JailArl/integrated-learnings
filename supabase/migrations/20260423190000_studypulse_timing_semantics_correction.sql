-- StudyPulse timing semantics correction
-- Ensure legacy row uses intended semantics:
--   first_reminder_time = first prompt time
--   check_completion_time = final follow-up time

UPDATE sq_study_settings
SET
  first_reminder_time = '18:00'::time,
  check_completion_time = '20:15'::time
WHERE child_id = '997305a4-87b3-4d93-81a0-b34da3e5f147'
  AND first_reminder_time = '16:00'::time
  AND check_completion_time = '18:00'::time;
-- Correct legacy timing semantics for one known child settings row.
-- first_reminder_time should represent first prompt time,
-- check_completion_time should represent final follow-up cutoff.

UPDATE sq_study_settings
SET
  first_reminder_time = '18:00',
  check_completion_time = '20:15'
WHERE child_id = '997305a4-87b3-4d93-81a0-b34da3e5f147'
  AND first_reminder_time = '16:00'
  AND check_completion_time = '18:00';
