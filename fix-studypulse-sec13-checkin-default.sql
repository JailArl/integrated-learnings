-- Fix legacy StudyPulse check-in default for Sec 1-3 children
-- Problem: some onboarding flows saved check_completion_time='21:00' for all levels.
-- Desired: Sec 1-3 default should be 20:00 on weekdays.

-- Preview rows affected
SELECT c.id AS child_id, c.name, c.level, s.check_completion_time
FROM sq_children c
JOIN sq_study_settings s ON s.child_id = c.id
WHERE upper(trim(c.level)) IN ('SEC1','SEC2','SEC3','SECONDARY 1','SECONDARY 2','SECONDARY 3')
  AND s.check_completion_time = '21:00';

-- Apply fix
UPDATE sq_study_settings s
SET check_completion_time = '20:00'
FROM sq_children c
WHERE s.child_id = c.id
  AND upper(trim(c.level)) IN ('SEC1','SEC2','SEC3','SECONDARY 1','SECONDARY 2','SECONDARY 3')
  AND s.check_completion_time = '21:00';

-- Verify
SELECT c.id AS child_id, c.name, c.level, s.check_completion_time
FROM sq_children c
JOIN sq_study_settings s ON s.child_id = c.id
WHERE upper(trim(c.level)) IN ('SEC1','SEC2','SEC3','SECONDARY 1','SECONDARY 2','SECONDARY 3')
ORDER BY c.level, c.name;
