-- Add sample session workshops for testing
INSERT INTO workshops (title, description, level, start_time, end_time, link, type, active, created_at, updated_at)
VALUES 
('Beginner Meditation Session', 'Join our ongoing meditation sessions anytime', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'https://zoom.us/j/session1', 'session', true, NOW(), NOW()),
('Advanced Yoga Practice', 'Advanced level yoga sessions available 24/7', 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'https://zoom.us/j/session2', 'session', true, NOW(), NOW()),
('Master Level Workshop', 'Exclusive master level sessions', 3, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'https://zoom.us/j/session3', 'session', true, NOW(), NOW());
