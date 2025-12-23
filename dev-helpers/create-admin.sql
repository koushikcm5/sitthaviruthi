-- Create admin user with password: Admin123
-- BCrypt hash for "Admin123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO user (name, username, email, phone, password, role, email_verified, approved, created_at)
VALUES (
  'Admin User',
  'admin',
  'admin@example.com',
  '1234567890',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN',
  1,
  1,
  NOW()
);

-- Verify the user was created
SELECT id, username, email, role, email_verified, approved FROM user WHERE username = 'admin';
