// Test script to check if Railway backend is working
const API_URL = 'http://localhost:8080/api/v1';

async function testRegister() {
  console.log('Testing registration...');
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'Test123'
      })
    });
    const data = await response.json();
    console.log('Register response:', response.status, data);
  } catch (error) {
    console.error('Register error:', error.message);
  }
}

async function testLogin() {
  console.log('\nTesting login...');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin123'
      })
    });
    const data = await response.json();
    console.log('Login response:', response.status, data);
  } catch (error) {
    console.error('Login error:', error.message);
  }
}

async function testHealth() {
  console.log('Testing backend health...');
  try {
    const response = await fetch(`${API_URL}/auth/pending-users`);
    console.log('Health check:', response.status);
  } catch (error) {
    console.error('Backend not reachable:', error.message);
  }
}

(async () => {
  await testHealth();
  await testRegister();
  await testLogin();
})();
