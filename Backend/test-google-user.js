const mongoose = require('mongoose');
const User = require('./Model/UserModel');
require('dotenv').config();

async function testGoogleUserCreation() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🔄 Testing Google OAuth user creation...');
        
        // Test creating a Google OAuth user (no password required)
        const googleUser = new User({
            googleId: 'test-google-id-12345',
            name: 'Test Google User',
            email: 'testgoogle@gmail.com',
            role: 'student',
            age: 25,
            authProvider: 'google',
            isVerified: true,
            status: 'active'
        });

        await googleUser.save();
        console.log('✅ Google OAuth user created successfully!');
        console.log('📋 User details:', {
            id: googleUser._id,
            name: googleUser.name,
            email: googleUser.email,
            authProvider: googleUser.authProvider,
            hasPassword: !!googleUser.password
        });

        // Clean up - remove the test user
        await User.findByIdAndDelete(googleUser._id);
        console.log('🧹 Test user cleaned up');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

testGoogleUserCreation();