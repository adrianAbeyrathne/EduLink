const validator = require('validator');

class ValidationUtils {
    
    /**
     * Validate email format with comprehensive checks
     */
    static validateEmail(email) {
        const errors = [];
        
        if (!email || typeof email !== 'string') {
            errors.push('Email is required');
            return { isValid: false, errors };
        }
        
        const trimmedEmail = email.trim().toLowerCase();
        
        // Length check
        if (trimmedEmail.length > 254) {
            errors.push('Email address is too long (max 254 characters)');
        }
        
        // Basic format check
        if (!validator.isEmail(trimmedEmail)) {
            errors.push('Please provide a valid email address');
        }
        
        // Check for common typos in domains
        const domain = trimmedEmail.split('@')[1];
        if (domain) {
            const suspiciousDomains = [
                'gmial.com', 'gmai.com', 'gamil.com', 'yahooo.com', 'yaho.com',
                'hotmial.com', 'hotmai.com', 'outlok.com', 'outloo.com', 'gmaill.com'
            ];
            if (suspiciousDomains.includes(domain)) {
                errors.push('Please check your email domain for typos');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitized: trimmedEmail
        };
    }
    
    /**
     * Validate password strength
     */
    static validatePassword(password, userInfo = {}) {
        const errors = [];
        
        if (!password || typeof password !== 'string') {
            errors.push('Password is required');
            return { isValid: false, errors };
        }
        
        // Skip validation for already hashed passwords
        if (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$')) {
            return { isValid: true, errors: [] };
        }
        
        // Length check
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        if (password.length > 128) {
            errors.push('Password is too long (max 128 characters)');
        }
        
        // Character requirements
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        // Common passwords check
        const weakPasswords = [
            'password', '123456', '12345678', 'qwerty', 'abc123', 
            'password123', 'admin', '1234567890', 'letmein', 'welcome',
            '1q2w3e4r', 'zaq12wsx', 'password1', '123123123'
        ];
        
        if (weakPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common. Please choose a more secure password');
        }
        
        // Sequential characters check
        if (/123456|abcdef|qwerty/.test(password.toLowerCase())) {
            errors.push('Password cannot contain sequential characters');
        }
        
        // Personal info check
        if (userInfo.name && password.toLowerCase().includes(userInfo.name.toLowerCase())) {
            errors.push('Password cannot contain your name');
        }
        
        if (userInfo.email && password.toLowerCase().includes(userInfo.email.split('@')[0].toLowerCase())) {
            errors.push('Password cannot contain your email address');
        }
        
        return { isValid: errors.length === 0, errors };
    }
    
    /**
     * Validate name field
     */
    static validateName(name) {
        const errors = [];
        
        if (!name || typeof name !== 'string') {
            errors.push('Name is required');
            return { isValid: false, errors };
        }
        
        const trimmedName = name.trim();
        
        if (trimmedName.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        if (trimmedName.length > 100) {
            errors.push('Name cannot exceed 100 characters');
        }
        
        // Allow letters, spaces, hyphens, apostrophes, and some unicode characters
        if (!/^[a-zA-Z\u00C0-\u017F\u0100-\u024F\s\-'.]+$/.test(trimmedName)) {
            errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
        }
        
        // Check for excessive spaces or special characters
        if (/\s{2,}/.test(trimmedName)) {
            errors.push('Name cannot contain multiple consecutive spaces');
        }
        
        if (/^[\s\-'.]+$/.test(trimmedName)) {
            errors.push('Name must contain at least one letter');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitized: trimmedName.replace(/\s+/g, ' ') // Replace multiple spaces with single space
        };
    }
    
    /**
     * Validate age
     */
    static validateAge(age) {
        const errors = [];
        
        if (age === undefined || age === null || age === '') {
            errors.push('Age is required');
            return { isValid: false, errors };
        }
        
        const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;
        
        if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
            errors.push('Age must be a valid whole number');
        } else {
            if (ageNum < 1) {
                errors.push('Age must be at least 1');
            }
            
            if (ageNum > 150) {
                errors.push('Age cannot exceed 150');
            }
            
            // Business logic: warn about unusual ages
            if (ageNum < 13 && !errors.length) {
                errors.push('Users under 13 may require parental consent');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitized: ageNum
        };
    }
    
    /**
     * Validate role
     */
    static validateRole(role) {
        const errors = [];
        const validRoles = ['student', 'tutor', 'admin'];
        
        if (!role || typeof role !== 'string') {
            return {
                isValid: true, // Role has default
                errors: [],
                sanitized: 'student'
            };
        }
        
        const trimmedRole = role.trim().toLowerCase();
        
        if (!validRoles.includes(trimmedRole)) {
            errors.push(`Role must be one of: ${validRoles.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitized: trimmedRole
        };
    }
    
    /**
     * Validate status
     */
    static validateStatus(status) {
        const errors = [];
        const validStatuses = ['active', 'inactive', 'suspended'];
        
        if (!status || typeof status !== 'string') {
            return {
                isValid: true, // Status has default
                errors: [],
                sanitized: 'active'
            };
        }
        
        const trimmedStatus = status.trim().toLowerCase();
        
        if (!validStatuses.includes(trimmedStatus)) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitized: trimmedStatus
        };
    }

    /**
     * Validate user availability status
     */
    static validateUserStatus(userStatus) {
        const errors = [];
        const validUserStatuses = ['Available', 'Away', 'Busy', 'Do Not Disturb'];
        
        if (!userStatus || typeof userStatus !== 'string') {
            return {
                isValid: true, // UserStatus has default
                errors: [],
                sanitized: 'Available'
            };
        }
        
        const trimmedUserStatus = userStatus.trim();
        
        if (!validUserStatuses.includes(trimmedUserStatus)) {
            errors.push(`User status must be one of: ${validUserStatuses.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitized: trimmedUserStatus
        };
    }
    
    /**
     * Validate MongoDB ObjectId
     */
    static validateObjectId(id) {
        const errors = [];
        
        if (!id || typeof id !== 'string') {
            errors.push('ID is required');
            return { isValid: false, errors };
        }
        
        if (!validator.isMongoId(id)) {
            errors.push('Invalid ID format');
        }
        
        return { isValid: errors.length === 0, errors };
    }
    
    /**
     * Sanitize user input to prevent XSS
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        return input
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript: urls
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }
    
    /**
     * Comprehensive user data validation
     */
    static validateUserData(userData, isUpdate = false) {
        const errors = {};
        const sanitized = {};
        
        // Name validation
        if (userData.name !== undefined) {
            const nameValidation = this.validateName(userData.name);
            if (!nameValidation.isValid) {
                errors.name = nameValidation.errors;
            } else {
                sanitized.name = nameValidation.sanitized;
            }
        } else if (!isUpdate) {
            errors.name = ['Name is required'];
        }
        
        // Email validation
        if (userData.email !== undefined) {
            const emailValidation = this.validateEmail(userData.email);
            if (!emailValidation.isValid) {
                errors.email = emailValidation.errors;
            } else {
                sanitized.email = emailValidation.sanitized;
            }
        } else if (!isUpdate) {
            errors.email = ['Email is required'];
        }
        
        // Password validation (only if provided)
        if (userData.password !== undefined && userData.password !== '') {
            const passwordValidation = this.validatePassword(userData.password, {
                name: userData.name || sanitized.name,
                email: userData.email || sanitized.email
            });
            if (!passwordValidation.isValid) {
                errors.password = passwordValidation.errors;
            }
        }
        
        // Age validation
        if (userData.age !== undefined) {
            const ageValidation = this.validateAge(userData.age);
            if (!ageValidation.isValid) {
                errors.age = ageValidation.errors;
            } else {
                sanitized.age = ageValidation.sanitized;
            }
        } else if (!isUpdate) {
            errors.age = ['Age is required'];
        }
        
        // Role validation
        if (userData.role !== undefined) {
            const roleValidation = this.validateRole(userData.role);
            if (!roleValidation.isValid) {
                errors.role = roleValidation.errors;
            } else {
                sanitized.role = roleValidation.sanitized;
            }
        }
        
        // Status validation
        if (userData.status !== undefined) {
            const statusValidation = this.validateStatus(userData.status);
            if (!statusValidation.isValid) {
                errors.status = statusValidation.errors;
            } else {
                sanitized.status = statusValidation.sanitized;
            }
        }

        // User Status validation (availability status)
        if (userData.userStatus !== undefined) {
            const userStatusValidation = this.validateUserStatus(userData.userStatus);
            if (!userStatusValidation.isValid) {
                errors.userStatus = userStatusValidation.errors;
            } else {
                sanitized.userStatus = userStatusValidation.sanitized;
            }
        }

        // Admin notes validation
        if (userData.adminNotes !== undefined) {
            if (typeof userData.adminNotes === 'string') {
                const trimmed = userData.adminNotes.trim();
                if (trimmed.length > 2000) {
                    errors.adminNotes = ['Admin notes cannot exceed 2000 characters'];
                } else {
                    sanitized.adminNotes = this.sanitizeInput(trimmed);
                }
            } else {
                errors.adminNotes = ['Admin notes must be text'];
            }
        }
        
        // Suspension validation
        if (userData.suspensionReason !== undefined) {
            if (typeof userData.suspensionReason === 'string') {
                const trimmed = userData.suspensionReason.trim();
                if (trimmed.length > 500) {
                    errors.suspensionReason = ['Suspension reason cannot exceed 500 characters'];
                } else {
                    sanitized.suspensionReason = this.sanitizeInput(trimmed);
                }
            }
        }
        
        if (userData.suspensionExpiry !== undefined && userData.suspensionExpiry !== null) {
            const expiry = new Date(userData.suspensionExpiry);
            if (isNaN(expiry.getTime())) {
                errors.suspensionExpiry = ['Invalid suspension expiry date'];
            } else if (expiry <= new Date()) {
                errors.suspensionExpiry = ['Suspension expiry date must be in the future'];
            } else {
                sanitized.suspensionExpiry = expiry;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            sanitized
        };
    }
    
    /**
     * Rate limiting helpers
     */
    static checkRateLimit(ip, action, windowMs = 15 * 60 * 1000, maxAttempts = 5) {
        // This would typically use Redis or similar for production
        // For now, return a simple implementation
        return {
            allowed: true,
            remainingAttempts: maxAttempts,
            resetTime: Date.now() + windowMs
        };
    }
}

module.exports = ValidationUtils;