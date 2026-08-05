-- Singleton app-wide settings (exactly one row, id = 1).
CREATE TABLE app_config (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    team_encryption_enabled BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO app_config (id, team_encryption_enabled)
VALUES (1, FALSE);
