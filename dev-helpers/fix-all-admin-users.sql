-- ========================================
-- FIX ALL ADMIN USERS IN RAILWAY DATABASE
-- Run this in Railway Dashboard → MySQL → Data tab
-- ========================================

-- Step 1: Check current state
SELECT username, email, role, email_verified, approved 
FROM user 
ORDER BY username;

-- Step 2: Update ALL users with username starting with 'admin' to ADMIN role
UPDATE user 
SET role='ADMIN', email_verified=1, approved=1 
WHERE username LIKE 'admin%';

-- Step 3: Verify the changes
SELECT username, email, role, email_verified, approved 
FROM user 
WHERE username LIKE 'admin%';

-- Step 4: Show all users grouped by role
SELECT role, GROUP_CONCAT(username) as usernames, COUNT(*) as count
FROM user 
GROUP BY role;
