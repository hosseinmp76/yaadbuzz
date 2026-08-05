-- Optional client-side encryption flag per team (AES key never stored on server).
ALTER TABLE team
    ADD COLUMN IF NOT EXISTS encryption_enabled BOOLEAN NOT NULL DEFAULT FALSE;
