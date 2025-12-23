// Check current users in Railway database
const API_URL = 'http://localhost:8080/api';

async function checkUsers() {
  console.log('Checking users in Railway database...\n');

  try {
    // Get pending users (should show users with approved=false)
    const response = await fetch(`${API_URL}/auth/pending-users`);
    const pendingUsers = await response.json();

    console.log('=== PENDING USERS (approved=false) ===');
    if (pendingUsers.length === 0) {
      console.log('No pending users found.');
    } else {
      pendingUsers.forEach(user => {
        console.log(`- ${user.username} (${user.email})`);
      });
    }

    console.log('\n=== WHAT YOU NEED TO DO ===');
    console.log('1. Go to Railway Dashboard → MySQL service → Data tab');
    console.log('2. Run this SQL to see all users:');
    console.log('   SELECT username, email, role, email_verified, approved FROM user;');
    console.log('\n3. Run this SQL to fix users:');
    console.log('   -- Make admin an ADMIN');
    console.log('   UPDATE user SET role=\'ADMIN\', email_verified=1, approved=1 WHERE username=\'admin\';');
    console.log('   ');
    console.log('   -- Make all others USER');
    console.log('   UPDATE user SET role=\'USER\', email_verified=1, approved=1 WHERE username!=\'admin\';');
    console.log('\n4. Verify:');
    console.log('   SELECT username, role FROM user ORDER BY role;');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();
