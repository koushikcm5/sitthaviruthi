-- Add type column to workshops table if it doesn't exist
ALTER TABLE workshops 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'upcoming';

-- Update existing workshops to have type 'upcoming'
UPDATE workshops 
SET type = 'upcoming' 
WHERE type IS NULL OR type = '';

-- Insert sample session workshops for testing
INSERT INTO workshops (title, description, level, start_time, end_time, link, type, active, created_at)
VALUES 
('Beginner Meditation Session', 'Join our always-available meditation session for Level 1 practitioners', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'https://example.com/session1', 'session', true, NOW()),
('Advanced Chakra Workshop', 'Deep dive into chakra cleansing techniques - available anytime', 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'https://example.com/session2', 'session', true, NOW()),
('Master Yoga Practice', 'Advanced yoga session for Level 3 practitioners', 3, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'https://example.com/session3', 'session', true, NOW());
