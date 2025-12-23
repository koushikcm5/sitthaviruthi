// Create admin2 user via API (which we know works), then show SQL to make it ADMIN
const API_URL = 'http://localhost:8080/api';

async function createAdmin2() {
  console.log('=== CREATING ADMIN2 USER ===\n');

  const admin2 = {
    name: 'Admin User 2',
    username: 'admin2',
    email: 'admin2@example.com',
    phone: '0987654321',
    password: 'Admin123'
  };

  console.log('Step 1: Registering admin2 via API...');
  console.log('Username:', admin2.username);
  console.log('Password:', admin2.password);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin2)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ User registered successfully!');
      console.log('Response:', data);

      console.log('\n=== STEP 2: UPDATE TO ADMIN ROLE ===');
      console.log('Now run this SQL in Railway MySQL → Data tab:\n');
      console.log('UPDATE user SET role=\'ADMIN\' WHERE username=\'admin2\';\n');
      console.log('=== VERIFY ===');
      console.log('SELECT username, role FROM user WHERE username=\'admin2\';\n');

      console.log('=== LOGIN CREDENTIALS ===');
      console.log('Username: admin2');
      console.log('Password: Admin123');
      console.log('\n⚠️  After running the SQL, logout and login again to get ADMIN access!');

    } else {
      console.log('\n❌ Registration failed!');
      console.log('Error:', data);

      if (data.error && data.error.includes('already exists')) {
        console.log('\n✅ User already exists! Just run this SQL to make it ADMIN:\n');
        console.log('UPDATE user SET role=\'ADMIN\', email_verified=1, approved=1 WHERE username=\'admin2\';\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdmin2();
