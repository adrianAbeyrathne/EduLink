const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Model/UserModel');
require('dotenv').config();

async function fixAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Hash the admin password
        const hashedPassword = await bcrypt.hash('admin123', 12);
        console.log('✅ Hashed password created');

        // Update the admin user with the password
        const result = await User.updateOne(
            { email: 'admin@edulink.com' },
            { 
                $set: { 
                    password: hashedPassword,
                    name: 'Admin User'  // Fix the name too
                } 
            }
        );

        console.log('Update result:', result);

        // Verify the update
        const user = await User.findOne({ email: 'admin@edulink.com' });
        console.log('\n✅ Updated admin user:');
        console.log('- Name:', user.name);
        console.log('- Email:', user.email);
        console.log('- Role:', user.role);
        console.log('- Password exists:', !!user.password);

        // Test login
        const isValid = await bcrypt.compare('admin123', user.password);
        console.log('- Password test:', isValid ? '✅ VALID' : '❌ INVALID');

        await mongoose.disconnect();
        console.log('\n🎉 Admin password fixed! You can now login with:');
        console.log('Email: admin@edulink.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error:', error);
    }
}

fixAdminPassword();