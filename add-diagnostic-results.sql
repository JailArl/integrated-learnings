-- Add diagnostic test results field to parent_requests
ALTER TABLE parent_requests ADD COLUMN IF NOT EXISTS diagnostic_test_results TEXT;
ALTER TABLE parent_requests ADD COLUMN IF NOT EXISTS diagnostic_test_notes TEXT;

-- Create index for faster queries on diagnostic results
CREATE INDEX IF NOT EXISTS idx_parent_requests_diagnostic_results ON parent_requests(diagnostic_test_results);
