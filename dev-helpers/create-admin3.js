// Create admin3 user via API - will automatically be ADMIN role
const API_URL = 'http://localhost:8080/api';

async function createAdmin3() {
  console.log('=== CREATING ADMIN3 USER ===\n');

  const admin3 = {
    name: 'Admin User 3',
    username: 'admin3',
    email: 'admin3@example.com',
    phone: '1122334455',
    password: 'Admin123'
  };

  console.log('Registering admin3...');
  console.log('Username:', admin3.username);
  console.log('Password:', admin3.password);
  console.log('Email:', admin3.email);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin3)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS! admin3 created!');
      console.log('Response:', data);

      // Wait 2 seconds then test login
      console.log('\nWaiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('\nTesting login...');
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: admin3.username,
          password: admin3.password
        })
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        console.log('\n✅ LOGIN SUCCESSFUL!');
        console.log('User Details:');
        console.log('  Username:', loginData.username);
        console.log('  Name:', loginData.name);
        console.log('  Role:', loginData.role);
        console.log('  Token:', loginData.token ? 'Generated ✓' : 'Missing');

        if (loginData.role === 'ADMIN') {
          console.log('\n🎉 VERIFIED: admin3 has ADMIN role!');
        } else {
          console.log('\n⚠️  WARNING: admin3 has', loginData.role, 'role (expected ADMIN)');
        }
      } else {
        console.log('\n❌ Login failed:', loginData);
      }

    } else {
      console.log('\n❌ Registration failed!');
      console.log('Error:', data);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

createAdmin3();
