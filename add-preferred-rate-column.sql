-- Add preferred_rate and tutor_type columns to parent_requests table

ALTER TABLE parent_requests
ADD COLUMN IF NOT EXISTS preferred_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tutor_type TEXT;

-- Add comment
COMMENT ON COLUMN parent_requests.preferred_rate IS 'Parent preferred hourly rate in SGD';
COMMENT ON COLUMN parent_requests.tutor_type IS 'Preferred tutor type: Undergraduate, Full-Time Tutor, or MOE/Ex-MOE Teacher';
