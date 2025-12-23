-- ========================================
-- FINAL WORKING SQL FOR RAILWAY MYSQL
-- Table name is "users" (not "user")
-- Run this in Railway Dashboard → MySQL → Data tab
-- ========================================

-- Step 1: View all current users
SELECT username, email, role, email_verified, approved 
FROM users 
ORDER BY username;

-- Step 2: Create admin user (if doesn't exist)
INSERT INTO users (name, username, email, phone, password, role, email_verified, approved, created_at)
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

-- Step 3: Update existing user to ADMIN (e.g., admin2)
UPDATE users SET role='ADMIN' WHERE username='admin2';

-- Step 4: Update ALL users starting with 'admin' to ADMIN role
UPDATE users 
SET role='ADMIN', email_verified=1, approved=1 
WHERE username LIKE 'admin%';

-- Step 5: Verify changes
SELECT username, email, role, email_verified, approved 
FROM users 
WHERE username LIKE 'admin%';

-- Step 6: Count users by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- ========================================
-- LOGIN CREDENTIALS
-- ========================================
-- Username: admin
-- Password: Admin123
-- 
-- Username: admin2  
-- Password: Admin123
-- ========================================
