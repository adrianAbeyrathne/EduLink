const mongoose = require('mongoose');

const externalUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    course: {
        type: String,
        required: true,
        enum: ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Business', 'Arts', 'Medicine', 'Law'],
        trim: true
    },
    year: {
        type: String,
        required: true,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt
});

module.exports = mongoose.model("ExternalUsers", externalUserSchema);