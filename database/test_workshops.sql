-- Test workshops for all levels
USE yoga_attendance;

-- Clear existing test workshops (optional)
-- DELETE FROM workshops WHERE title LIKE '%Test%';

-- Add upcoming workshops (future events)
INSERT INTO workshops (title, description, level, start_time, end_time, link, type, active, created_at)
VALUES 
('Level 1 Upcoming Workshop', 'Join us for beginner level workshop', 1, 
 DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY + INTERVAL 2 HOUR), 
 'https://zoom.us/j/upcoming1', 'upcoming', true, NOW()),

('Level 2 Upcoming Workshop', 'Intermediate level workshop session', 2, 
 DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY + INTERVAL 2 HOUR), 
 'https://zoom.us/j/upcoming2', 'upcoming', true, NOW()),

('Level 3 Upcoming Workshop', 'Advanced yoga workshop', 3, 
 DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY + INTERVAL 2 HOUR), 
 'https://zoom.us/j/upcoming3', 'upcoming', true, NOW());

-- Add session workshops (always available)
INSERT INTO workshops (title, description, level, start_time, end_time, link, type, active, created_at)
VALUES 
('Level 1 Session Workshop', 'Ongoing beginner sessions - join anytime', 1, 
 NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 
 'https://zoom.us/j/session1', 'session', true, NOW()),

('Level 2 Session Workshop', 'Ongoing intermediate sessions', 2, 
 NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 
 'https://zoom.us/j/session2', 'session', true, NOW()),

('Level 3 Session Workshop', 'Ongoing advanced sessions', 3, 
 NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 
 'https://zoom.us/j/session3', 'session', true, NOW());

-- Verify
SELECT id, title, level, type, start_time, end_time, active FROM workshops ORDER BY level, type;
