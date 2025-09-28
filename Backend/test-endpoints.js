const axios = require('axios');

async function testEndpoints() {
    const baseUrl = 'http://localhost:5000';
    
    console.log('Testing server endpoints...\n');
    
    try {
        // Test root endpoint
        console.log('1. Testing root endpoint (/)...');
        const rootResponse = await axios.get(`${baseUrl}/`);
        console.log('✅ Root endpoint works:', rootResponse.data);
    } catch (error) {
        console.log('❌ Root endpoint failed:', error.message);
        return; // If server isn't running, no point testing further
    }
    
    try {
        // Test health endpoint
        console.log('\n2. Testing health endpoint...');
        const healthResponse = await axios.get(`${baseUrl}/health`);
        console.log('✅ Health endpoint works:', healthResponse.data);
    } catch (error) {
        console.log('❌ Health endpoint failed:', error.message);
    }
    
    try {
        // Test auth register endpoint with proper data
        console.log('\n3. Testing auth register endpoint...');
        const testUser = {
            name: 'Test Student',
            email: 'teststudent123@test.com',
            password: 'test123456',
            role: 'student',
            age: 20
        };
        
        const authResponse = await axios.post(`${baseUrl}/api/auth/register`, testUser);
        console.log('✅ Auth register works!');
        console.log('Response:', {
            success: authResponse.data.success,
            message: authResponse.data.message,
            user: authResponse.data.user?.name,
            hasToken: !!authResponse.data.token
        });
    } catch (error) {
        console.log('❌ Auth register failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testEndpoints();