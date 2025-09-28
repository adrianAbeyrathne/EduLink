const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Model/UserModel');
require('dotenv').config();

async function createTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create test users if they don't exist
        const testUsers = [
            {
                name: 'Admin User',
                email: 'admin@edulink.com',
                password: 'admin123',
                role: 'admin',
                age: 30
            },
            {
                name: 'John Tutor',
                email: 'tutor@edulink.com',
                password: 'tutor123',
                role: 'tutor',
                age: 28
            },
            {
                name: 'Jane Student',
                email: 'student@edulink.com',
                password: 'student123',
                role: 'student',
                age: 20
            }
        ];

        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            
            if (!existingUser) {
                // Hash password
                const hashedPassword = await bcrypt.hash(userData.password, 12);
                
                // Create user
                const user = new User({
                    ...userData,
                    password: hashedPassword,
                    status: 'active'
                });
                
                await user.save();
                console.log(`✅ Created ${userData.role} user: ${userData.email}`);
            } else {
                console.log(`⚠️ User already exists: ${userData.email}`);
            }
        }

        console.log('\n🎉 Test users setup complete!');
        console.log('\n📋 You can now login with:');
        console.log('Admin: admin@edulink.com / admin123');
        console.log('Tutor: tutor@edulink.com / tutor123');
        console.log('Student: student@edulink.com / student123');

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');

    } catch (error) {
        console.error('Error creating test users:', error);
        process.exit(1);
    }
}

createTestUsers();