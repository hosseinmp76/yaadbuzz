-- Social login (Google / GitHub). Password optional for OAuth-only accounts.
ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
    ADD COLUMN oauth_provider VARCHAR(32),
    ADD COLUMN oauth_subject VARCHAR(255);

CREATE UNIQUE INDEX ux_users_oauth_provider_subject
    ON users (oauth_provider, oauth_subject)
    WHERE oauth_provider IS NOT NULL AND oauth_subject IS NOT NULL AND deleted_at IS NULL;
