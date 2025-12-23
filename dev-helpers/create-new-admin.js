// Create new admin user using the WORKING method:
// 1. Register via API (creates USER)
// 2. Update to ADMIN in database
const API_URL = 'http://localhost:8080/api';

async function createNewAdmin() {
  console.log('=== CREATING NEW ADMIN USER ===\n');

  const newAdmin = {
    name: 'New Admin User',
    username: 'newadmin',
    email: 'newadmin@example.com',
    phone: '5555555555',
    password: 'Admin123'
  };

  console.log('Step 1: Registering user via API...');
  console.log('Username:', newAdmin.username);
  console.log('Password:', newAdmin.password);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ User registered successfully!');
      console.log('Response:', data);

      console.log('\n=== STEP 2: UPDATE TO ADMIN IN RAILWAY ===');
      console.log('Go to Railway Dashboard → MySQL → Data tab');
      console.log('Run this SQL:\n');
      console.log(`UPDATE users SET role='ADMIN' WHERE username='${newAdmin.username}';\n`);
      console.log('Verify:');
      console.log(`SELECT username, role FROM users WHERE username='${newAdmin.username}';\n`);

      console.log('=== LOGIN CREDENTIALS ===');
      console.log('Username:', newAdmin.username);
      console.log('Password:', newAdmin.password);
      console.log('\n⚠️  After running the SQL, you can login with ADMIN access!');

    } else {
      console.log('\n❌ Registration failed!');
      console.log('Error:', data);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

createNewAdmin();
