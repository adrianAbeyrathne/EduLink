const User = require("../Model/UserModel");
const bcrypt = require('bcryptjs');
const ValidationUtils = require('../utils/ValidationUtils');
// const ActivityLogger = require('../Services/ActivityLogger'); // Temporarily commented out

const getAllUsers = async (req, res, next) => {
    // If DB is not connected, return 503 Service Unavailable
    const ready = User.db.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    if (ready !== 1) {
        return res.status(503).json({ message: 'Database not connected', readyState: ready });
    }

    try {
        const users = await User.find().sort({ createdAt: -1 }); // Get all users, newest first
        console.log('✅ Found users:', users.length);
        
        // Return empty array with 200 instead of 404 when no users
        return res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch users' });
    }
};

const addUsers = async (req, res, next) => {
    console.log('�🚨🚨 USERCONTROLLER ADDUSERS CALLED - THIS SHOULD BE VISIBLE 🚨🚨🚨');
    console.log('�📥 addUsers called - CRUD User Creation');
    console.log('🔍 req.body:', req.body);
    console.log('📋 Content-Type:', req.headers['content-type']);
    
    try {
        // Check if req.body exists and has the required data
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                message: "Request body is missing or empty. Ensure Content-Type is application/json" 
            });
        }

        const { name, email, role, age, status } = req.body;

        console.log('📝 Extracted fields:', { name, email, role, age, status });

        // Validate required fields
        const missingFields = [];
        if (!name || typeof name !== 'string' || name.trim() === '') {
            missingFields.push('name');
        }
        if (!email || typeof email !== 'string' || email.trim() === '') {
            missingFields.push('email');
        }
        if (age === undefined || age === null || isNaN(parseInt(age))) {
            missingFields.push('age');
        }

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing or invalid required fields: ${missingFields.join(', ')}`,
                providedFields: Object.keys(req.body),
                missingFields
            });
        }

        // Validate age range
        const ageNum = parseInt(age);
        if (ageNum < 1 || ageNum > 150) {
            return res.status(400).json({ 
                message: "Age must be between 1 and 150" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ 
                message: "Please provide a valid email address" 
            });
        }

        // Generate a secure default password for admin-created users
        const generateSecurePassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const timestamp = Date.now().toString().slice(-4);
            let randomPart = '';
            for (let i = 0; i < 6; i++) {
                randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return `EduLink${timestamp}${randomPart}`;
        };

        const defaultPassword = generateSecurePassword();
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        
        console.log('🔐 Generated secure password for admin-created user');

        // Prepare user data with proper validation and defaults
        const userData = { 
            name: name.trim(), 
            email: email.trim().toLowerCase(), 
            password: hashedPassword,
            role: (role && typeof role === 'string' && role.trim() !== '') 
                  ? role.trim().toLowerCase() 
                  : 'student', 
            age: ageNum, 
            status: (status && typeof status === 'string' && status.trim() !== '') 
                    ? status.trim().toLowerCase() 
                    : 'active',
            isAdminCreated: true  // Flag to bypass password validation
        };

        // Validate role value
        const validRoles = ['student', 'tutor', 'admin'];
        if (!validRoles.includes(userData.role)) {
            return res.status(400).json({ 
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
                providedRole: userData.role
            });
        }

        // Validate status value
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(userData.status)) {
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                providedStatus: userData.status
            });
        }

        console.log('💾 Creating user with validated data:', {
            ...userData,
            password: '[HASHED_PASSWORD]'
        });
        
        // Create and save the user
        console.log('🔧 About to create new User instance...');
        const newUser = new User(userData);
        console.log('🔧 User instance created, about to save...');
        const savedUser = await newUser.save();
        console.log('✅ User saved successfully!');

        console.log('✅ User created successfully with ID:', savedUser._id);

        // Prepare response without sensitive data
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        return res.status(201).json({ 
            success: true,
            users: userResponse, // Keep 'users' for frontend compatibility
            message: "User created successfully by admin",
            generatedPassword: defaultPassword,
            note: "This password was auto-generated. User should change it upon first login."
        });

    } catch (err) {
        console.error('❌ Error in addUsers CRUD operation:', err);
        
        // Handle duplicate email error
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: "Email address is already registered. Please use a different email.",
                field: "email",
                providedEmail: req.body?.email
            });
        }
        
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const validationErrors = {};
            const errorMessages = [];
            
            Object.keys(err.errors).forEach(key => {
                validationErrors[key] = err.errors[key].message;
                errorMessages.push(`${key}: ${err.errors[key].message}`);
            });
            
            return res.status(400).json({ 
                success: false,
                message: "Validation failed: " + errorMessages.join(', '),
                errors: validationErrors
            });
        }
        
        // Handle cast errors (invalid data types)
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                message: `Invalid ${err.path}: ${err.value}` 
            });
        }
        
        // Generic error handler
        return res.status(500).json({ 
            success: false,
            message: "Internal server error occurred while creating user. Please try again." 
        });
    }
};

const getById = async (req, res, next) => {
    const id = req.params.id;
    console.log('🔍 getById called with id:', id);

    let user;

    try {
        user = await User.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
};

const updateUser = async (req, res, next) => {
    const id = req.params.id;
    
    console.log('📝 updateUser called for ID:', id);
    console.log('🔍 Update data:', req.body);

    // Validate ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Check if req.body exists and has data
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ 
            message: "Request body is missing or empty. Please provide fields to update." 
        });
    }

    const { 
        name, 
        email, 
        role, 
        age, 
        status, 
        password, 
        isVerified, 
        suspensionReason, 
        suspensionExpiry, 
        forcePasswordReset, 
        isLocked, 
        adminNotes 
    } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    
    if (name !== undefined && name !== null) {
        if (name.trim() === '') {
            return res.status(400).json({ message: "Name cannot be empty" });
        }
        updateData.name = name.trim();
    }
    
    if (email !== undefined && email !== null) {
        if (email.trim() === '') {
            return res.status(400).json({ message: "Email cannot be empty" });
        }
        updateData.email = email.trim().toLowerCase();
    }
    
    if (role !== undefined && role !== null) {
        updateData.role = role.trim().toLowerCase();
    }
    
    if (age !== undefined && age !== null) {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
            return res.status(400).json({ 
                message: "Age must be a valid number between 1 and 150" 
            });
        }
        updateData.age = ageNum;
    }

    // Handle status change with history tracking
    if (status !== undefined && status !== null) {
        const currentUser = await User.findById(id);
        if (currentUser && currentUser.status !== status.trim().toLowerCase()) {
            // Add to status change history
            const statusChange = {
                previousStatus: currentUser.status,
                newStatus: status.trim().toLowerCase(),
                reason: suspensionReason || 'Status updated by admin',
                changedBy: 'Admin', // TODO: Get actual admin user from auth token
                changedAt: new Date()
            };
            updateData.$push = { statusChangeHistory: statusChange };
        }
        updateData.status = status.trim().toLowerCase();
    }
    
    // Professional admin fields
    if (isVerified !== undefined) {
        updateData.isVerified = Boolean(isVerified);
    }
    
    if (suspensionReason !== undefined) {
        updateData.suspensionReason = suspensionReason.trim();
    }
    
    if (suspensionExpiry !== undefined && suspensionExpiry !== null && suspensionExpiry !== '') {
        updateData.suspensionExpiry = new Date(suspensionExpiry);
    } else if (suspensionExpiry === '' || suspensionExpiry === null) {
        updateData.suspensionExpiry = null;
    }
    
    if (forcePasswordReset !== undefined) {
        updateData.forcePasswordReset = Boolean(forcePasswordReset);
    }
    
    if (isLocked !== undefined) {
        updateData.isLocked = Boolean(isLocked);
    }
    
    if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes.trim();
    }

    // If password is provided, hash it
    if (password && password.trim() !== '') {
        try {
            updateData.password = await bcrypt.hash(password.trim(), 12);
        } catch (hashError) {
            console.error('❌ Password hashing error:', hashError);
            return res.status(500).json({ message: "Error processing password" });
        }
    }

    console.log('💾 Update data to apply:', {
        ...updateData,
        password: updateData.password ? '[HASHED]' : '[NOT_PROVIDED]'
    });
    
    try {
        // Get the original user data for activity logging
        const originalUser = await User.findById(id);
        if (!originalUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData,
            { 
                new: true, 
                runValidators: true,
                context: 'query' // Ensures validators run properly
            }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return user without password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        console.log('✅ User updated successfully:', updatedUser._id);
        return res.status(200).json({ 
            users: userResponse,
            message: "User updated successfully"
        });

    } catch (err) {
        console.error('❌ Error updating user:', err);
        
        // Handle duplicate email error
        if (err.code === 11000) {
            return res.status(400).json({ 
                message: "Email address is already taken by another user",
                field: "email"
            });
        }
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const validationErrors = {};
            const errorMessages = [];
            
            Object.keys(err.errors).forEach(key => {
                validationErrors[key] = err.errors[key].message;
                errorMessages.push(err.errors[key].message);
            });
            
            return res.status(400).json({ 
                message: "Validation failed: " + errorMessages.join(', '),
                errors: validationErrors
            });
        }
        
        // Handle cast errors (invalid ObjectId, etc.)
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid data format provided" });
        }
        
        return res.status(500).json({ message: "Unable to update user details" });
    }
}

const deleteUser = async (req, res, next) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: 'User id is required' });
    }

    try {
        // Get user data before deletion for activity logging
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await User.findByIdAndDelete(id);

        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Invalid user id' });
    }
}

// Flexible delete: allow DELETE /users?id=... or id in JSON body
const deleteUserFlexible = async (req, res, next) => {
    const id = req.query.id || req.body?.id;
    if (!id) {
        return res.status(400).json({ message: 'User id is required (use /users/:id or provide id in query/body)' });
    }
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Invalid user id' });
    }
}

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;    
exports.deleteUserFlexible = deleteUserFlexible;

// Profile picture upload controller
exports.uploadProfilePic = async (req, res) => {
    const id = req.params.id;
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            id,
            { profilePic: `/uploads/${req.file.filename}` },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user, message: 'Profile picture uploaded successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error uploading profile picture' });
    }
};