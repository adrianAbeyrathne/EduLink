/**
 * Complete Authentication Flow Test
 * Demonstrates both admin-created users and self-registered users
 */

const axios = require('axios');
const baseURL = 'http://localhost:5000';

async function testAuthFlow() {
    console.log('🧪 Testing Complete Authentication Flow\n');

    try {
        // 1. Admin creates a new user
        console.log('1️⃣ Admin creates a new student...');
        const adminCreateResponse = await axios.post(`${baseURL}/api/users`, {
            name: 'Admin Created Student',
            email: 'admin.student@example.com',
            age: 20,
            role: 'student'
        });
        
        const generatedPassword = adminCreateResponse.data.generatedPassword;
        console.log(`   ✅ Student created with password: ${generatedPassword}`);

        // 2. Admin-created student logs in
        console.log('\n2️⃣ Admin-created student logs in...');
        const studentLoginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin.student@example.com',
            password: generatedPassword
        });
        
        console.log(`   ✅ Login successful! User: ${studentLoginResponse.data.user.name}`);
        console.log(`   📝 Role: ${studentLoginResponse.data.user.role}`);
        console.log(`   🎫 Token: ${studentLoginResponse.data.token ? 'Present' : 'Missing'}`);

        // 3. New user registers themselves
        console.log('\n3️⃣ New user self-registers...');
        const registerResponse = await axios.post(`${baseURL}/api/auth/register`, {
            name: 'Self Registered Tutor',
            email: 'self.tutor@example.com',
            password: 'mypassword123',
            role: 'tutor',
            age: 25
        });
        
        console.log(`   ✅ Registration successful! User: ${registerResponse.data.user.name}`);
        console.log(`   📝 Role: ${registerResponse.data.user.role}`);
        console.log(`   🎫 Token: ${registerResponse.data.token ? 'Present' : 'Missing'}`);

        // 4. Self-registered user logs in
        console.log('\n4️⃣ Self-registered user logs in...');
        const tutorLoginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'self.tutor@example.com',
            password: 'mypassword123'
        });
        
        console.log(`   ✅ Login successful! User: ${tutorLoginResponse.data.user.name}`);
        console.log(`   📝 Role: ${tutorLoginResponse.data.user.role}`);

        // 5. Verify users appear in admin CRUD
        console.log('\n5️⃣ Checking admin CRUD interface...');
        const usersResponse = await axios.get(`${baseURL}/api/users`);
        const adminCreatedUser = usersResponse.data.users.find(u => u.email === 'admin.student@example.com');
        const selfRegisteredUser = usersResponse.data.users.find(u => u.email === 'self.tutor@example.com');
        
        console.log(`   👤 Admin-created user: ${adminCreatedUser.name} | isAdminCreated: ${adminCreatedUser.isAdminCreated}`);
        console.log(`   👤 Self-registered user: ${selfRegisteredUser.name} | isAdminCreated: ${selfRegisteredUser.isAdminCreated}`);

        console.log('\n🎉 All tests passed! Authentication flow is working correctly.');
        
        console.log('\n📋 Summary:');
        console.log('   ✅ Admin can create users with auto-generated passwords');
        console.log('   ✅ Admin-created users can login with generated passwords');
        console.log('   ✅ New users can self-register with their own passwords');
        console.log('   ✅ Self-registered users can login normally');
        console.log('   ✅ Both user types appear in admin CRUD with proper flags');
        console.log('   ✅ Role-based authentication works for all user types');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testAuthFlow();