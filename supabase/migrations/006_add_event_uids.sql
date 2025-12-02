-- Add UID column
ALTER TABLE events ADD COLUMN IF NOT EXISTS uid UUID DEFAULT gen_random_uuid();

-- Make UID required and unique
ALTER TABLE events ALTER COLUMN uid SET NOT NULL;
ALTER TABLE events ADD CONSTRAINT events_uid_key UNIQUE (uid);

-- Generate UIDs for existing events
UPDATE events SET uid = gen_random_uuid() WHERE uid IS NULL;