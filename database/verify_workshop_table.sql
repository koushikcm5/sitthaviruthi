-- Verify workshop table structure
USE yoga_attendance;

-- Check if type column exists
DESCRIBE workshops;

-- Check existing workshops
SELECT id, title, level, type, start_time, end_time, active FROM workshops;

-- If type column doesn't exist, add it
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'upcoming';

-- Update existing workshops to have type
UPDATE workshops SET type = 'upcoming' WHERE type IS NULL OR type = '';
