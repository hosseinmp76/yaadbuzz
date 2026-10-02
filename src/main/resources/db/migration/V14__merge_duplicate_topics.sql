-- Flyway runs this migration in a PostgreSQL transaction. Block concurrent
-- writes while planning the merge and installing the unique constraint.
LOCK TABLE topic, topic_vote IN SHARE ROW EXCLUSIVE MODE;

-- Prefer an active topic, then the oldest topic, with UUID as a stable tie-break.
-- Title equality is exact and case-sensitive, matching the unique constraint.
CREATE TEMPORARY TABLE topic_merge_map ON COMMIT DROP AS
SELECT id AS topic_id, canonical_topic_id
FROM (
    SELECT id,
           first_value(id) OVER (
               PARTITION BY team_id, title
               ORDER BY (deleted_at IS NOT NULL), created_at, id
           ) AS canonical_topic_id,
           count(*) OVER (PARTITION BY team_id, title) AS duplicates
    FROM topic
) grouped
WHERE duplicates > 1;

-- Preserve the original rows, including the survivor and all its votes, so
-- conflicting nominee choices remain recoverable. Deliberately no foreign keys:
-- the original topic rows are about to be removed. This is migration history,
-- not live application data, and is never used when calculating standings.
CREATE TABLE topic_deduplication_archive (
    topic_id UUID PRIMARY KEY,
    canonical_topic_id UUID NOT NULL,
    topic_data JSONB NOT NULL,
    votes_data JSONB NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO topic_deduplication_archive
    (topic_id, canonical_topic_id, topic_data, votes_data)
SELECT t.id, m.canonical_topic_id, to_jsonb(t),
       COALESCE((
           SELECT jsonb_agg(to_jsonb(v) ORDER BY v.created_at, v.id)
           FROM topic_vote v WHERE v.topic_id = t.id
       ), '[]'::jsonb)
FROM topic t
JOIN topic_merge_map m ON m.topic_id = t.id;

-- There can only be one vote per (topic, voter). For conflicting nominees,
-- keep the most recently created vote (UUID breaks timestamp ties). Sum the
-- repetitions for that voter's chosen nominee across the duplicate topics.
-- Other nominee choices remain in the archive instead of being reassigned.
CREATE TEMPORARY TABLE topic_vote_merge ON COMMIT DROP AS
SELECT v.id, m.canonical_topic_id,
       row_number() OVER (
           PARTITION BY m.canonical_topic_id, v.voter_id
           ORDER BY v.created_at DESC, v.id
       ) AS vote_rank,
       sum(v.repetitions) OVER (
           PARTITION BY m.canonical_topic_id, v.voter_id, v.nominee_id
       ) AS repetitions
FROM topic_vote v
JOIN topic_merge_map m ON m.topic_id = v.topic_id;

-- Remove conflicting rows before moving votes to avoid the existing
-- UNIQUE (topic_id, voter_id) constraint during the update.
DELETE FROM topic_vote v
USING topic_vote_merge m
WHERE v.id = m.id AND m.vote_rank > 1;

UPDATE topic_vote v
SET topic_id = m.canonical_topic_id,
    repetitions = m.repetitions::INTEGER
FROM topic_vote_merge m
WHERE v.id = m.id AND m.vote_rank = 1;

DELETE FROM topic t
USING topic_merge_map m
WHERE t.id = m.topic_id AND m.topic_id <> m.canonical_topic_id;

ALTER TABLE topic
    ADD CONSTRAINT uk_topic_team_title UNIQUE (team_id, title);
