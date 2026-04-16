ALTER TABLE sq_crash_course_interest
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE sq_holiday_programme_interest
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_sq_crash_course_interest_status
ON sq_crash_course_interest(status);

CREATE INDEX IF NOT EXISTS idx_sq_holiday_programme_interest_status
ON sq_holiday_programme_interest(status);