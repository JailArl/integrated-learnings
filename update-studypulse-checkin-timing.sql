-- Run this in Supabase SQL Editor to align live StudyPulse timings.
-- Focus: Sec1-Sec3 prompt at 8:00 PM (was 7:30 PM in older setup).

UPDATE sq_checkin_schedule
SET
  weekday_kid_checkin = '20:00',
  weekday_followup = '20:45',
  weekday_parent_report = '21:45',
  weekend_kid_checkin = '15:30',
  weekend_parent_report = '18:00'
WHERE level_group = 'secondary_lower';

-- Optional sanity check
SELECT level_group, level_range, weekday_kid_checkin, weekday_followup, weekday_parent_report, weekend_kid_checkin, weekend_parent_report
FROM sq_checkin_schedule
ORDER BY level_group;
