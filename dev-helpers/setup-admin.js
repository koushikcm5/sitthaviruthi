const API_URL = 'http://localhost:8080/api/v1';

async function setupAdmin() {
    console.log('⏳ Creating Admin User...');
    try {
        const response = await fetch(`${API_URL}/fix/create-admin`, {
            method: 'POST'
        });
        const data = await response.json();
        console.log('Response:', data);

        if (response.ok) {
            console.log('\n✅ SUCCESS! You can now login due to Admin User creation.');
            console.log('Username: admin');
            console.log('Password: Admin123');
        } else {
            console.log('❌ Failed:', data);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('Make sure backend is running!');
    }
}

setupAdmin();
