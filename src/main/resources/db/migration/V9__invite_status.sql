-- Pending / accepted / rejected for email invitations (shareable codes stay PENDING until used).
ALTER TABLE invite
    ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'PENDING';

CREATE INDEX idx_invite_email_status ON invite (email, status);
