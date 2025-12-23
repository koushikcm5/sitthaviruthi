USE yoga_attendance;

-- Create admin user with username: admin, password: admin123
INSERT INTO users (name, username, email, phone, password, role, level, months_completed, created_at)
VALUES ('Admin', 'admin', 'admin@yoga.com', '1234567890', 
        '$2a$10$N9qo8uLOickgx2ZrVzgeGe7DDZaAVZ.1.Z9jFapcvVU0sHxIL6emu', 
        'ADMIN', 1, 0, NOW());
