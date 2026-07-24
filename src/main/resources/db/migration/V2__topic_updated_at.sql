ALTER TABLE topic ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
UPDATE topic SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE topic ALTER COLUMN updated_at SET DEFAULT NOW();
