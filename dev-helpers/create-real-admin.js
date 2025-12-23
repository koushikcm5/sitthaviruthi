// Create a real admin user you can actually use
const API_URL = 'http://localhost:8080/api/v1';

async function createRealAdmin() {
  const admin = {
    name: 'Super Admin',
    username: 'superadmin',
    email: 'superadmin@example.com',
    phone: '9876543210',
    password: 'Admin123'
  };

  console.log('Creating superadmin user...');
  console.log('Username:', admin.username);
  console.log('Password:', admin.password);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ User created successfully!');

      // Wait and test login
      await new Promise(r => setTimeout(r, 2000));

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: admin.username,
          password: admin.password
        })
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        console.log('\n✅ LOGIN SUCCESSFUL!');
        console.log('Role:', loginData.role);
        console.log('\n=== USE THESE CREDENTIALS ===');
        console.log('Username: superadmin');
        console.log('Password: Admin123');
        console.log('Role:', loginData.role);
      } else {
        console.log('\n❌ Login failed:', loginData);
      }

    } else {
      console.log('\n❌ Registration failed:', data);

      if (data.error && data.error.includes('already exists')) {
        console.log('\n✅ User already exists! Use these credentials:');
        console.log('Username: superadmin');
        console.log('Password: Admin123');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createRealAdmin();
