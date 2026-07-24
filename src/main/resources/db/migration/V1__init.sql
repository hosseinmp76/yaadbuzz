CREATE TABLE users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE media_asset (
    id              UUID PRIMARY KEY,
    storage_key     VARCHAR(512) NOT NULL UNIQUE,
    url             VARCHAR(1024) NOT NULL,
    mime_type       VARCHAR(128) NOT NULL,
    size_bytes      BIGINT NOT NULL DEFAULT 0,
    uploaded_by_id  UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    brand_color     VARCHAR(32),
    logo_id         UUID REFERENCES media_asset(id),
    owner_id        UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE organization_membership (
    id              UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organization(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    role            VARCHAR(32) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

CREATE TABLE team (
    id              UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organization(id),
    name            VARCHAR(255) NOT NULL,
    brand_color     VARCHAR(32),
    cover_media_id  UUID REFERENCES media_asset(id),
    reveal_tributes BOOLEAN NOT NULL DEFAULT FALSE,
    reveal_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE invite (
    id              UUID PRIMARY KEY,
    team_id         UUID NOT NULL REFERENCES team(id),
    code            VARCHAR(64) NOT NULL UNIQUE,
    role            VARCHAR(32) NOT NULL DEFAULT 'MEMBER',
    max_uses        INTEGER,
    use_count       INTEGER NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ,
    created_by_id   UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_member (
    id              UUID PRIMARY KEY,
    team_id         UUID NOT NULL REFERENCES team(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    nickname        VARCHAR(255) NOT NULL,
    bio             TEXT,
    role            VARCHAR(32) NOT NULL DEFAULT 'MEMBER',
    avatar_id       UUID REFERENCES media_asset(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE (team_id, user_id),
    UNIQUE (team_id, nickname)
);

CREATE TABLE tribute (
    id              UUID PRIMARY KEY,
    team_id         UUID NOT NULL REFERENCES team(id),
    writer_id       UUID NOT NULL REFERENCES team_member(id),
    recipient_id    UUID NOT NULL REFERENCES team_member(id),
    text            TEXT NOT NULL,
    is_anonymous    BOOLEAN NOT NULL DEFAULT FALSE,
    is_private      BOOLEAN NOT NULL DEFAULT FALSE,
    hidden          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE tribute_report (
    id              UUID PRIMARY KEY,
    tribute_id      UUID NOT NULL REFERENCES tribute(id),
    reporter_id     UUID NOT NULL REFERENCES team_member(id),
    reason          TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE memory (
    id              UUID PRIMARY KEY,
    team_id         UUID NOT NULL REFERENCES team(id),
    writer_id       UUID NOT NULL REFERENCES team_member(id),
    title           VARCHAR(255),
    body_text       TEXT NOT NULL,
    is_private      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE memory_tag (
    memory_id       UUID NOT NULL REFERENCES memory(id) ON DELETE CASCADE,
    team_member_id  UUID NOT NULL REFERENCES team_member(id) ON DELETE CASCADE,
    PRIMARY KEY (memory_id, team_member_id)
);

CREATE TABLE comment (
    id              UUID PRIMARY KEY,
    memory_id       UUID NOT NULL REFERENCES memory(id) ON DELETE CASCADE,
    writer_id       UUID NOT NULL REFERENCES team_member(id),
    parent_id       UUID REFERENCES comment(id),
    text            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE comment_media (
    comment_id      UUID NOT NULL REFERENCES comment(id) ON DELETE CASCADE,
    media_asset_id  UUID NOT NULL REFERENCES media_asset(id),
    PRIMARY KEY (comment_id, media_asset_id)
);

CREATE TABLE topic (
    id              UUID PRIMARY KEY,
    team_id         UUID NOT NULL REFERENCES team(id),
    title           VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE topic_vote (
    id              UUID PRIMARY KEY,
    topic_id        UUID NOT NULL REFERENCES topic(id) ON DELETE CASCADE,
    voter_id        UUID NOT NULL REFERENCES team_member(id),
    nominee_id      UUID NOT NULL REFERENCES team_member(id),
    repetitions     INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (topic_id, voter_id)
);

CREATE TABLE characteristic (
    id              UUID PRIMARY KEY,
    team_member_id  UUID NOT NULL REFERENCES team_member(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    count           INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (team_member_id, title)
);

CREATE TABLE yearbook_export (
    id              UUID PRIMARY KEY,
    team_id         UUID NOT NULL REFERENCES team(id),
    requested_by_id UUID NOT NULL REFERENCES users(id),
    status          VARCHAR(32) NOT NULL,
    file_url        VARCHAR(1024),
    storage_key     VARCHAR(512),
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_team_org ON team(organization_id);
CREATE INDEX idx_team_member_team ON team_member(team_id);
CREATE INDEX idx_tribute_team ON tribute(team_id);
CREATE INDEX idx_tribute_recipient ON tribute(recipient_id);
CREATE INDEX idx_memory_team ON memory(team_id);
CREATE INDEX idx_topic_team ON topic(team_id);
CREATE INDEX idx_invite_code ON invite(code);
CREATE INDEX idx_yearbook_team ON yearbook_export(team_id);
