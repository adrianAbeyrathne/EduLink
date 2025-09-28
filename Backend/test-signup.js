const axios = require('axios');

async function testSignup() {
    try {
        console.log('Testing user registration...');
        
        const testUser = {
            name: 'Test Student',
            email: 'teststudent@test.com',
            password: 'test123456',
            role: 'student',
            age: 20
        };

        const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
        
        console.log('✅ Registration successful!');
        console.log('User ID:', response.data.user._id);
        console.log('Name:', response.data.user.name);
        console.log('Email:', response.data.user.email);
        console.log('Role:', response.data.user.role);
        console.log('Token received:', response.data.token ? 'Yes' : 'No');
        
    } catch (error) {
        console.log('❌ Registration failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message || error.response.data.error);
            console.log('Details:', error.response.data);
        } else {
            console.log('Network error:', error.message);
        }
    }
}

testSignup();