-- Migration script for Fal.ai
-- Step 1: Add new column fal_request_id (if not exists)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS fal_request_id TEXT;

-- Step 2: Drop genre column (if exists)
ALTER TABLE tracks DROP COLUMN IF EXISTS genre;

-- Step 3: Drop mood column (if exists)
ALTER TABLE tracks DROP COLUMN IF EXISTS mood;

-- Step 4: Drop cover_url column (if exists)
ALTER TABLE tracks DROP COLUMN IF EXISTS cover_url;

-- Step 5: Drop suno_id column (if still exists)
ALTER TABLE tracks DROP COLUMN IF EXISTS suno_id;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tracks'
ORDER BY ordinal_position;
