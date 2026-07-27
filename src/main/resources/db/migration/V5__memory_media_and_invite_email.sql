-- Memory image attachments (mirrors comment_media)
CREATE TABLE memory_media (
    memory_id UUID NOT NULL REFERENCES memory(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES media_asset(id),
    PRIMARY KEY (memory_id, media_asset_id)
);

-- Optional invitee email for email-based invitations
ALTER TABLE invite
    ADD COLUMN IF NOT EXISTS email VARCHAR(320);
