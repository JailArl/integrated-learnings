-- Allow parents to manage their own weekly targets from the dashboard

BEGIN;

ALTER TABLE sq_weekly_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sq_weekly_targets_read" ON sq_weekly_targets;
DROP POLICY IF EXISTS "sq_weekly_targets_service" ON sq_weekly_targets;
DROP POLICY IF EXISTS "sq_weekly_targets_parent_owner" ON sq_weekly_targets;

CREATE POLICY "sq_weekly_targets_parent_owner" ON sq_weekly_targets
  FOR ALL
  USING (
    child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
    OR auth.jwt()->>'role' = 'service_role'
  )
  WITH CHECK (
    child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
    OR auth.jwt()->>'role' = 'service_role'
  );

COMMIT;
