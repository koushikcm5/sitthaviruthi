-- ========================================
-- CREATE NEW ADMIN USER: admin2
-- Run this in Railway Dashboard → MySQL → Data tab
-- ========================================

-- Step 1: Check if admin2 already exists
SELECT * FROM user WHERE username='admin2';

-- Step 2: Create admin2 user with ADMIN role
-- Password: Admin123 (BCrypt hash)
INSERT INTO user (name, username, email, phone, password, role, email_verified, approved, created_at)
VALUES (
  'Admin User 2',
  'admin2',
  'admin2@example.com',
  '0987654321',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN',
  1,
  1,
  NOW()
);

-- Step 3: Also fix existing users
-- Make 'admin' an ADMIN
UPDATE user 
SET role='ADMIN', email_verified=1, approved=1 
WHERE username='admin';

-- Make 'testuser123' a USER
UPDATE user 
SET role='USER', email_verified=1, approved=1 
WHERE username='testuser123';

-- Step 4: Verify all users
SELECT username, email, role, email_verified, approved 
FROM user 
ORDER BY 
  CASE 
    WHEN role='ADMIN' THEN 1 
    ELSE 2 
  END, 
  username;

-- Step 5: Show only ADMIN users
SELECT username, email, role 
FROM user 
WHERE role='ADMIN';
