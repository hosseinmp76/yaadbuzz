-- Tribute image attachments (mirrors memory_media)
CREATE TABLE tribute_media (
    tribute_id UUID NOT NULL REFERENCES tribute(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES media_asset(id),
    PRIMARY KEY (tribute_id, media_asset_id)
);
