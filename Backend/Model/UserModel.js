const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
        validate: {
            validator: function(v) {
                // Allow letters, spaces, hyphens, and apostrophes
                return /^[a-zA-Z\s\-']+$/.test(v);
            },
            message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        validate: [
            {
                validator: function(v) {
                    // More comprehensive email validation with proper regex
                    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    return emailRegex.test(v);
                },
                message: 'Please provide a valid email address'
            },
            {
                validator: function(v) {
                    // Check email length
                    return v.length <= 254; // RFC 5321 limit
                },
                message: 'Email address is too long (max 254 characters)'
            },
            {
                validator: function(v) {
                    // Prevent common typos in popular domains
                    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
                    const domain = v.split('@')[1];
                    if (domain) {
                        // Check for common typos like gmial.com, yahooo.com
                        const suspiciousDomains = [
                            'gmial.com', 'gmai.com', 'gamil.com', 'yahooo.com', 'yaho.com',
                            'hotmial.com', 'hotmai.com', 'outlok.com', 'outloo.com'
                        ];
                        return !suspiciousDomains.includes(domain);
                    }
                    return true;
                },
                message: 'Please check your email domain for typos'
            }
        ]
    },
    password: {
        type: String,
        required: function() {
            // Password is required for local auth users but not for Google OAuth users
            return this.authProvider !== 'google' && !this.googleId && !this.isAdminCreated;
        },
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: [
            {
                validator: function(v) {
                    // Only validate password strength for new passwords or when explicitly changed
                    if (!v) return true; // Let required validation handle empty passwords
                    
                    // Skip validation for hashed passwords (they start with $2a, $2b, etc.)
                    if (v.startsWith('$2a$') || v.startsWith('$2b$') || v.startsWith('$2y$')) {
                        return true;
                    }
                    
                    // Password strength validation for plain text passwords
                    const hasUpperCase = /[A-Z]/.test(v);
                    const hasLowerCase = /[a-z]/.test(v);
                    const hasNumbers = /\d/.test(v);
                    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v);
                    
                    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
                },
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            },
            {
                validator: function(v) {
                    if (!v) return true;
                    if (v.startsWith('$2a$') || v.startsWith('$2b$') || v.startsWith('$2y$')) {
                        return true;
                    }
                    // Check for common weak passwords
                    const weakPasswords = [
                        'password', '123456', '12345678', 'qwerty', 'abc123', 
                        'password123', 'admin', '1234567890', 'letmein', 'welcome'
                    ];
                    return !weakPasswords.includes(v.toLowerCase());
                },
                message: 'Password is too common. Please choose a more secure password'
            },
            {
                validator: function(v) {
                    if (!v) return true;
                    if (v.startsWith('$2a$') || v.startsWith('$2b$') || v.startsWith('$2y$')) {
                        return true;
                    }
                    // Prevent passwords that are just the user's name or email
                    if (this.name && v.toLowerCase().includes(this.name.toLowerCase())) {
                        return false;
                    }
                    if (this.email && v.toLowerCase().includes(this.email.split('@')[0].toLowerCase())) {
                        return false;
                    }
                    return true;
                },
                message: 'Password cannot contain your name or email address'
            }
        ]
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['student', 'tutor', 'admin'],
            message: 'Role must be either student, tutor, or admin'
        },
        default: 'student',
        lowercase: true
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [1, 'Age must be at least 1'],
        max: [150, 'Age cannot exceed 150'],
        validate: {
            validator: function(v) {
                return Number.isInteger(v);
            },
            message: 'Age must be a whole number'
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
        lowercase: true
    },
    userStatus: {
        type: String,
        enum: ['Available', 'Away', 'Busy', 'Do Not Disturb'],
        default: 'Available'
    },
    profilePic: {
        type: String,
        default: '', // Stores the file path or URL
    },
    // Additional profile fields for enhanced user experience
    bio: {
        type: String,
        default: '',
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    school: {
        type: String,
        default: '',
        trim: true,
        maxlength: [200, 'School name cannot exceed 200 characters']
    },
    grade: {
        type: String,
        default: '',
        trim: true
    },
    subjects: [{
        type: String,
        trim: true
    }],
    // Additional fields for user profile
    phone: {
        type: String,
        default: '',
        trim: true,
        validate: {
            validator: function(v) {
                // Allow empty phone number or valid phone format
                if (!v || v === '') return true;
                // Basic phone validation - allows various formats
                return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
            },
            message: 'Please provide a valid phone number'
        }
    },
    location: {
        type: String,
        default: '',
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    experience: {
        type: String,
        default: '',
        trim: true,
        maxlength: [1000, 'Experience cannot exceed 1000 characters']
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        studyReminders: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        }
    },
    isAdminCreated: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    // Professional admin features
    isVerified: {
        type: Boolean,
        default: false
    },
    suspensionReason: {
        type: String,
        default: '',
        trim: true,
        maxlength: [500, 'Suspension reason cannot exceed 500 characters'],
        validate: {
            validator: function(v) {
                // If suspended, reason should be provided
                if (this.status === 'suspended' && (!v || v.trim() === '')) {
                    return false;
                }
                return true;
            },
            message: 'Suspension reason is required when status is suspended'
        }
    },
    suspensionExpiry: {
        type: Date,
        default: null,
        validate: {
            validator: function(v) {
                // If suspension expiry is set, it should be in the future
                if (v && v <= new Date()) {
                    return false;
                }
                return true;
            },
            message: 'Suspension expiry date must be in the future'
        }
    },
    forcePasswordReset: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    adminNotes: {
        type: String,
        default: '',
        trim: true,
        maxlength: [2000, 'Admin notes cannot exceed 2000 characters']
    },
    statusChangeHistory: [{
        previousStatus: String,
        newStatus: String,
        reason: String,
        changedBy: String, // User ID or name of admin who made the change
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    loginAttempts: {
        count: {
            type: Number,
            default: 0
        },
        lastAttempt: {
            type: Date,
            default: null
        },
        lockedUntil: {
            type: Date,
            default: null
        }
    },
    // Google OAuth fields
    googleId: {
        type: String,
        sparse: true, // Allow null values while maintaining uniqueness
        unique: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    // Two-Factor Authentication fields
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        default: null
    },
    twoFactorBackupCodes: [{
        code: String,
        used: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // OTP for email-based 2FA
    emailOTP: {
        code: String,
        expires: Date,
        attempts: {
            type: Number,
            default: 0
        }
    },
    // Enhanced security tracking
    lastLogin: {
        type: Date,
        default: null
    },
    loginHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String,
        method: {
            type: String,
            enum: ['password', 'google', '2fa'],
            default: 'password'
        }
    }]
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: false // Remove __v field
});

// Add indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ name: 1 });

// Pre-save middleware to ensure email uniqueness with better error message
UserSchema.pre('save', async function(next) {
    console.log('🔍 Pre-save middleware triggered');
    console.log('📊 User data:', {
        isNew: this.isNew,
        hasPassword: !!this.password,
        passwordLength: this.password ? this.password.length : 0,
        isAdminCreated: this.isAdminCreated,
        email: this.email,
        name: this.name
    });
    
    // Check password requirement - only require if not admin-created AND not Google OAuth user
    if (this.isNew && (!this.password || this.password.trim() === '')) {
        console.log('❌ Password validation failed - no password provided');
        console.log('🔍 User details:', {
            isAdminCreated: this.isAdminCreated,
            authProvider: this.authProvider,
            googleId: this.googleId,
            email: this.email
        });
        
        if (!this.isAdminCreated && this.authProvider !== 'google' && !this.googleId) {
            console.log('❌ Regular user registration requires password');
            const error = new Error('Password is required');
            return next(error);
        } else if (this.isAdminCreated) {
            console.log('✅ Admin created user, password not required');
        } else if (this.authProvider === 'google' || this.googleId) {
            console.log('✅ Google OAuth user, password not required');
        }
    } else {
        console.log('✅ Password validation passed');
    }
    
    if (this.isModified('email')) {
        const existingUser = await this.constructor.findOne({ 
            email: this.email,
            _id: { $ne: this._id } // Exclude current document for updates
        });
        if (existingUser) {
            const error = new Error('Email address is already registered');
            error.code = 11000; // MongoDB duplicate key error code
            return next(error);
        }
    }
    next();
});

// Instance method to get user info without sensitive data
UserSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    // Remove any sensitive fields if added in the future
    return userObject;
};

// Static method to find users by email domain
UserSchema.statics.findByEmailDomain = function(domain) {
    return this.find({ email: new RegExp(`@${domain}$`, 'i') });
};

module.exports = mongoose.model("UserModel", UserSchema);

