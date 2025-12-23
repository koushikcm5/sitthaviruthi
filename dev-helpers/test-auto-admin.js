// Test if auto-ADMIN feature is working
const API_URL = 'http://localhost:8080/api';

async function testAutoAdmin() {
  const timestamp = Date.now();
  const testUser = {
    name: 'Test Admin',
    username: 'admin' + timestamp,  // Starts with 'admin' so should be ADMIN
    email: 'admin' + timestamp + '@example.com',
    phone: '1234567890',
    password: 'Test1234'
  };

  console.log('Testing auto-ADMIN feature...');
  console.log('Username:', testUser.username, '(starts with "admin")');

  try {
    // Register
    const regResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const regData = await regResponse.json();
    console.log('\n✅ Registered:', regData);

    // Wait 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    // Login to check role
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password
      })
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      console.log('\n✅ Login successful!');
      console.log('Role:', loginData.role);

      if (loginData.role === 'ADMIN') {
        console.log('\n🎉 SUCCESS! Auto-ADMIN is WORKING!');
        console.log('Users with username starting with "admin" are automatically ADMIN!');
      } else {
        console.log('\n❌ FAILED! User has role:', loginData.role);
        console.log('Auto-ADMIN feature is NOT working yet.');
        console.log('Railway deployment may not be finished.');
      }
    } else {
      console.log('\n❌ Login failed:', loginData);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAutoAdmin();
