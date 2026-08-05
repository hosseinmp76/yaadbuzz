-- Drop organization layer; keep users, teams, team_member, invites, and content.
DROP TABLE IF EXISTS organization_membership;

DROP INDEX IF EXISTS idx_team_org;
ALTER TABLE team DROP CONSTRAINT IF EXISTS team_organization_id_fkey;
ALTER TABLE team DROP COLUMN IF EXISTS organization_id;

DROP TABLE IF EXISTS organization;
