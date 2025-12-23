// Test registration API
const API_URL = 'http://localhost:8080/api/v1';

async function testRegister() {
  console.log('Testing registration API...');
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        username: 'testuser123',
        email: 'test123@example.com',
        phone: '1234567890',
        password: 'Test1234'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Registration successful!');

      // Try to login
      console.log('\nTesting login...');
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser123',
          password: 'Test1234'
        })
      });

      const loginData = await loginResponse.json();
      console.log('Login Status:', loginResponse.status);
      console.log('Login Response:', JSON.stringify(loginData, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRegister();
