// Create admin user - username MUST start with "admin"
const API_URL = 'http://localhost:8080/api';

async function createAdminUser() {
  const admin = {
    name: 'Main Admin',
    username: 'adminmain',  // Starts with "admin" - will be ADMIN role
    email: 'adminmain@example.com',
    phone: '9876543210',
    password: 'Admin123'
  };

  console.log('Creating admin user...');
  console.log('Username:', admin.username, '(starts with "admin")');
  console.log('Password:', admin.password);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ User created!');

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

        if (loginData.role === 'ADMIN') {
          console.log('\n🎉 SUCCESS! User has ADMIN role!');
        }

        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('Username: adminmain');
        console.log('Password: Admin123');
        console.log('Role:', loginData.role);
      } else {
        console.log('\n❌ Login failed:', loginData);
      }

    } else {
      console.log('\n❌ Registration failed:', data);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createAdminUser();
