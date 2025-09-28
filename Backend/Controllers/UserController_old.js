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
    console.log('🚨🚨 USERCONTROLLER ADDUSERS CALLED - WITH PROFESSIONAL VALIDATION 🚨🚨');
    console.log('📥 addUsers called - CRUD User Creation');
    console.log('🔍 req.body:', req.body);
    console.log('📋 Content-Type:', req.headers['content-type']);
    
    try {
        // Check if req.body exists and has the required data
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "Request body is missing or empty. Ensure Content-Type is application/json",
                errors: { general: ['Request body is required'] }
            });
        }

        // Comprehensive validation using ValidationUtils
        const validation = ValidationUtils.validateUserData(req.body, false);
        
        if (!validation.isValid) {
            console.log('❌ Validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                message: "Validation failed. Please check your input data.",
                errors: validation.errors,
                providedFields: Object.keys(req.body)
            });
        }

        const sanitizedData = validation.sanitized;
        console.log('✅ Data validated and sanitized:', {
            ...sanitizedData,
            password: '[REDACTED]'
        });

        // Check for duplicate email
        const existingUser = await User.findOne({ email: sanitizedData.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email address is already registered. Please use a different email.",
                errors: { email: ['Email address is already taken'] },
                field: "email",
                providedEmail: sanitizedData.email
            });
        }

        // Generate a secure default password for admin-created users
        const generateSecurePassword = () => {
            const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
            const numbers = '0123456789';
            const specialChars = '!@#$%^&*';
            const timestamp = Date.now().toString().slice(-4);
            
            let password = '';
            password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
            password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
            password += numbers.charAt(Math.floor(Math.random() * numbers.length));
            password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
            
            // Add random characters
            const allChars = upperChars + lowerChars + numbers + specialChars;
            for (let i = 0; i < 4; i++) {
                password += allChars.charAt(Math.floor(Math.random() * allChars.length));
            }
            
            // Shuffle the password
            return 'EduLink' + timestamp + password.split('').sort(() => 0.5 - Math.random()).join('');
        };

        const defaultPassword = generateSecurePassword();
        
        // Validate the generated password (should always pass)
        const passwordValidation = ValidationUtils.validatePassword(defaultPassword, {
            name: sanitizedData.name,
            email: sanitizedData.email
        });
        
        if (!passwordValidation.isValid) {
            console.error('❌ Generated password failed validation:', passwordValidation.errors);
            // Generate a new one
            const backupPassword = `EduLink${Date.now()}!Aa1`;
            const hashedPassword = await bcrypt.hash(backupPassword, 12);
            sanitizedData.password = hashedPassword;
            console.log('🔐 Used backup password generation');
        } else {
            const hashedPassword = await bcrypt.hash(defaultPassword, 12);
            sanitizedData.password = hashedPassword;
            console.log('🔐 Generated and validated secure password');
        }

        // Set admin-created flag
        sanitizedData.isAdminCreated = true;

        console.log('💾 Creating user with validated data...');
        
        // Create and save the user
        const newUser = new User(sanitizedData);
        const savedUser = await newUser.save();
        
        console.log('✅ User created successfully with ID:', savedUser._id);

        // Prepare response without sensitive data
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        return res.status(201).json({ 
            success: true,
            users: userResponse, // Keep 'users' for frontend compatibility
            message: "User created successfully by admin",
            generatedPassword: defaultPassword,
            note: "This password was auto-generated. User should change it upon first login.",
            validationsPassed: Object.keys(validation.sanitized)
        });

    } catch (err) {
        console.error('❌ Error in addUsers CRUD operation:', err);
        
        // Handle duplicate email error (MongoDB level)
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: "Email address is already registered. Please use a different email.",
                errors: { email: ['Email address is already taken'] },
                field: "email"
            });
        }
        
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const validationErrors = {};
            const errorMessages = [];
            
            Object.keys(err.errors).forEach(key => {
                validationErrors[key] = [err.errors[key].message];
                errorMessages.push(`${key}: ${err.errors[key].message}`);
            });
            
            return res.status(400).json({ 
                success: false,
                message: "Data validation failed: " + errorMessages.join(', '),
                errors: validationErrors
            });
        }
        
        // Handle cast errors (invalid data types)
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                message: `Invalid ${err.path}: ${err.value}`,
                errors: { [err.path]: [`Invalid ${err.path} format`] }
            });
        }
        
        // Generic error handler
        return res.status(500).json({ 
            success: false,
            message: "Internal server error occurred while creating user. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getById = async (req, res, next) => {
    const id = req.params.id;
    console.log('🔍 getById called with id:', id);

    // Validate ObjectId format
    const idValidation = ValidationUtils.validateObjectId(id);
    if (!idValidation.isValid) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid user ID format",
            errors: { id: idValidation.errors }
        });
    }

    try {
        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        return res.status(200).json({ 
            success: true,
            user 
        });
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        return res.status(500).json({ 
            success: false,
            message: "Error retrieving user" 
        });
    }
};

const updateUser = async (req, res, next) => {
    const id = req.params.id;
    
    console.log('📝 updateUser called for ID:', id);
    console.log('🔍 Update data:', req.body);

    // Validate ID format
    const idValidation = ValidationUtils.validateObjectId(id);
    if (!idValidation.isValid) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid user ID format",
            errors: { id: idValidation.errors }
        });
    }

    // Check if req.body exists and has data
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ 
            success: false,
            message: "Request body is missing or empty. Please provide fields to update.",
            errors: { general: ['Update data is required'] }
        });
    }

    try {
        // Get the current user for validation context
        const currentUser = await User.findById(id);
        if (!currentUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Comprehensive validation for update data
        const validation = ValidationUtils.validateUserData(req.body, true);
        
        if (!validation.isValid) {
            console.log('❌ Update validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                message: "Validation failed. Please check your input data.",
                errors: validation.errors
            });
        }

        const sanitizedData = validation.sanitized;

        // If email is being updated, check for duplicates
        if (sanitizedData.email && sanitizedData.email !== currentUser.email) {
            const existingUser = await User.findOne({ 
                email: sanitizedData.email,
                _id: { $ne: id }
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email address is already taken by another user",
                    errors: { email: ['Email address is already taken'] }
                });
            }
        }

        // Handle password update
        if (sanitizedData.password) {
            const passwordValidation = ValidationUtils.validatePassword(sanitizedData.password, {
                name: sanitizedData.name || currentUser.name,
                email: sanitizedData.email || currentUser.email
            });
            
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: "Password validation failed",
                    errors: { password: passwordValidation.errors }
                });
            }
            
            // Hash the new password
            sanitizedData.password = await bcrypt.hash(sanitizedData.password, 12);
        }

        // Handle status change with history tracking
        if (sanitizedData.status && sanitizedData.status !== currentUser.status) {
            const statusChange = {
                previousStatus: currentUser.status,
                newStatus: sanitizedData.status,
                reason: req.body.suspensionReason || 'Status updated by admin',
                changedBy: 'Admin', // TODO: Get actual admin user from auth token
                changedAt: new Date()
            };
            sanitizedData.$push = { statusChangeHistory: statusChange };
        }

        console.log('💾 Update data to apply:', {
            ...sanitizedData,
            password: sanitizedData.password ? '[HASHED]' : '[NOT_PROVIDED]'
        });

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            sanitizedData,
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        console.log('✅ User updated successfully:', updatedUser._id);
        return res.status(200).json({ 
            success: true,
            users: updatedUser,
            message: "User updated successfully",
            updatedFields: Object.keys(validation.sanitized)
        });

    } catch (err) {
        console.error('❌ Error updating user:', err);
        
        // Handle duplicate email error
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: "Email address is already taken by another user",
                errors: { email: ['Email address is already taken'] }
            });
        }
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const validationErrors = {};
            const errorMessages = [];
            
            Object.keys(err.errors).forEach(key => {
                validationErrors[key] = [err.errors[key].message];
                errorMessages.push(err.errors[key].message);
            });
            
            return res.status(400).json({ 
                success: false,
                message: "Validation failed: " + errorMessages.join(', '),
                errors: validationErrors
            });
        }
        
        // Handle cast errors
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                message: "Invalid data format provided",
                errors: { [err.path]: [`Invalid ${err.path} format`] }
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: "Unable to update user details",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const deleteUser = async (req, res, next) => {
    const id = req.params.id;

    // Validate ID format
    const idValidation = ValidationUtils.validateObjectId(id);
    if (!idValidation.isValid) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid user ID format",
            errors: { id: idValidation.errors }
        });
    }

    try {
        // Get user data before deletion for activity logging
        const userToDelete = await User.findById(id).select('-password');
        if (!userToDelete) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Prevent deletion of admin users (business logic)
        if (userToDelete.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users',
                errors: { role: ['Admin users cannot be deleted'] }
            });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        return res.status(200).json({ 
            success: true,
            user: deletedUser,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ 
            success: false,
            message: 'Error deleting user',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Flexible delete: allow DELETE /users?id=... or id in JSON body
const deleteUserFlexible = async (req, res, next) => {
    const id = req.query.id || req.body?.id;
    
    if (!id) {
        return res.status(400).json({ 
            success: false,
            message: 'User ID is required (use /users/:id or provide id in query/body)',
            errors: { id: ['User ID is required'] }
        });
    }

    // Use the main delete function
    req.params.id = id;
    return deleteUser(req, res, next);
};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;    
exports.deleteUserFlexible = deleteUserFlexible;

// Profile picture upload controller with validation
exports.uploadProfilePic = async (req, res) => {
    const id = req.params.id;
    
    // Validate ID format
    const idValidation = ValidationUtils.validateObjectId(id);
    if (!idValidation.isValid) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid user ID format",
            errors: { id: idValidation.errors }
        });
    }

    if (!req.file) {
        return res.status(400).json({ 
            success: false,
            message: 'No file uploaded',
            errors: { file: ['Profile picture file is required'] }
        });
    }

    // Validate file type and size
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
            errors: { file: ['Invalid file type'] }
        });
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxFileSize) {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
            errors: { file: ['File size exceeds limit'] }
        });
    }

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { profilePic: `/uploads/${req.file.filename}` },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        return res.status(200).json({ 
            success: true,
            user, 
            message: 'Profile picture uploaded successfully' 
        });
    } catch (err) {
        console.error('Profile picture upload error:', err);
        return res.status(500).json({ 
            success: false,
            message: 'Error uploading profile picture',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};