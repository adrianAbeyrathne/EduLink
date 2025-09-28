const mongoose = require('mongoose');
const User = require('./Model/UserModel');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

// Dummy user data
const dummyUsers = [
    {
        name: "Alice Johnson",
        email: "alice.johnson@student.edu",
        role: "student",
        age: 20,
        status: "active"
    },
    {
        name: "Bob Smith",
        email: "bob.smith@student.edu",
        role: "student",
        age: 22,
        status: "active"
    },
    {
        name: "Carol Davis",
        email: "carol.davis@student.edu",
        role: "student",
        age: 19,
        status: "inactive"
    },
    {
        name: "Emily Brown",
        email: "emily.brown@tutor.edu",
        role: "tutor",
        age: 35,
        status: "active"
    },
    {
        name: "Michael Wilson",
        email: "michael.wilson@tutor.edu",
        role: "tutor",
        age: 42,
        status: "active"
    },
    {
        name: "Sarah Miller",
        email: "sarah.miller@tutor.edu",
        role: "tutor",
        age: 38,
        status: "suspended"
    },
    {
        name: "John Doe",
        email: "admin@edulink.com",
        role: "admin",
        age: 45,
        status: "active"
    },
    {
        name: "System Admin",
        email: "sysadmin@edulink.com",
        role: "admin",
        age: 40,
        status: "active"
    },
    {
        name: "David Lee",
        email: "david.lee@student.edu",
        role: "student",
        age: 21,
        status: "active"
    },
    {
        name: "Lisa Garcia",
        email: "lisa.garcia@student.edu",
        role: "student",
        age: 23,
        status: "active"
    }
];

// Function to add dummy data
const addDummyData = async () => {
    try {
        // Clear existing users (optional)
        console.log('🗑️ Clearing existing users...');
        await User.deleteMany({});
        
        // Add dummy users
        console.log('📝 Adding dummy users...');
        const createdUsers = await User.insertMany(dummyUsers);
        
        console.log(`✅ Successfully added ${createdUsers.length} dummy users:`);
        createdUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.role}) - ${user.email}`);
        });
        
    } catch (error) {
        console.error('❌ Error adding dummy data:', error.message);
        if (error.code === 11000) {
            console.log('💡 Some users with these emails might already exist');
        }
    }
};

// Main function
const main = async () => {
    console.log('🚀 Starting dummy data insertion...');
    await connectDB();
    await addDummyData();
    
    console.log('✨ Dummy data insertion completed!');
    process.exit(0);
};

// Run the script
main().catch((error) => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
});