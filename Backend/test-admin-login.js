const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Model/UserModel');
require('dotenv').config();

async function testLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the admin user
        const user = await User.findOne({ email: 'admin@edulink.com' });
        if (!user) {
            console.log('❌ Admin user not found');
            return;
        }

        console.log('✅ Found admin user:');
        console.log('- Name:', user.name);
        console.log('- Email:', user.email);
        console.log('- Role:', user.role);
        console.log('- Status:', user.status);
        console.log('- Password (hashed):', user.password ? 'EXISTS' : 'MISSING');
        console.log('- Password length:', user.password ? user.password.length : 'N/A');

        // Test password comparison
        const testPassword = 'admin123';
        console.log('\n🔐 Testing password comparison...');
        console.log('- Test password:', testPassword);
        
        try {
            const isValid = await bcrypt.compare(testPassword, user.password);
            console.log('- Comparison result:', isValid);
        } catch (error) {
            console.log('❌ bcrypt.compare error:', error.message);
        }

        await mongoose.disconnect();

    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();