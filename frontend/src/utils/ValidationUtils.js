import toast from 'react-hot-toast';

/**
 * Frontend Validation Utilities for Professional Form Validation
 * Matches backend ValidationUtils for consistency
 */
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
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(trimmedEmail)) {
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
     * Validate password strength with real-time feedback
     */
    static validatePassword(password, userInfo = {}) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        
        if (!password || typeof password !== 'string') {
            errors.push('Password is required');
            return { isValid: false, errors, warnings, suggestions, strength: 0 };
        }
        
        let strength = 0;
        
        // Length check
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        } else if (password.length >= 8) {
            strength += 1;
        }
        
        if (password.length > 128) {
            errors.push('Password is too long (max 128 characters)');
        }
        
        // Character requirements
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
            suggestions.push('Add an uppercase letter (A-Z)');
        } else {
            strength += 1;
        }
        
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
            suggestions.push('Add a lowercase letter (a-z)');
        } else {
            strength += 1;
        }
        
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
            suggestions.push('Add a number (0-9)');
        } else {
            strength += 1;
        }
        
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
            suggestions.push('Add a special character (!@#$%^&*)');
        } else {
            strength += 1;
        }
        
        // Additional strength checks
        if (password.length >= 12) {
            strength += 1;
        }
        
        // Common passwords check
        const weakPasswords = [
            'password', '123456', '12345678', 'qwerty', 'abc123', 
            'password123', 'admin', '1234567890', 'letmein', 'welcome',
            '1q2w3e4r', 'zaq12wsx', 'password1', '123123123'
        ];
        
        if (weakPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common. Please choose a more secure password');
            strength = Math.max(0, strength - 2);
        }
        
        // Sequential characters check
        if (/123456|abcdef|qwerty/.test(password.toLowerCase())) {
            warnings.push('Avoid sequential characters');
            strength = Math.max(0, strength - 1);
        }
        
        // Repeated characters check
        if (/(.)\1{2,}/.test(password)) {
            warnings.push('Avoid repeating the same character');
            strength = Math.max(0, strength - 1);
        }
        
        // Personal info check
        if (userInfo.name && password.toLowerCase().includes(userInfo.name.toLowerCase())) {
            errors.push('Password cannot contain your name');
            strength = Math.max(0, strength - 2);
        }
        
        if (userInfo.email && password.toLowerCase().includes(userInfo.email.split('@')[0].toLowerCase())) {
            errors.push('Password cannot contain your email address');
            strength = Math.max(0, strength - 2);
        }
        
        // Strength calculation (0-5)
        strength = Math.min(5, Math.max(0, strength));
        
        return { 
            isValid: errors.length === 0, 
            errors, 
            warnings, 
            suggestions,
            strength 
        };
    }
    
    /**
     * Get password strength label and color
     */
    static getPasswordStrengthInfo(strength) {
        const strengthInfo = {
            0: { label: 'Very Weak', color: '#dc2626', bgColor: '#fee2e2' },
            1: { label: 'Weak', color: '#ea580c', bgColor: '#fed7aa' },
            2: { label: 'Fair', color: '#ca8a04', bgColor: '#fef3c7' },
            3: { label: 'Good', color: '#16a34a', bgColor: '#dcfce7' },
            4: { label: 'Strong', color: '#059669', bgColor: '#d1fae5' },
            5: { label: 'Very Strong', color: '#047857', bgColor: '#a7f3d0' }
        };
        
        return strengthInfo[strength] || strengthInfo[0];
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
     * Real-time form validation with visual feedback
     */
    static validateFormField(fieldName, value, userInfo = {}, showToast = false) {
        let validation;
        
        switch (fieldName) {
            case 'name':
                validation = this.validateName(value);
                break;
            case 'email':
                validation = this.validateEmail(value);
                break;
            case 'password':
                validation = this.validatePassword(value, userInfo);
                break;
            case 'age':
                validation = this.validateAge(value);
                break;
            default:
                validation = { isValid: true, errors: [] };
        }
        
        // Show toast notifications for critical errors
        if (showToast && !validation.isValid && validation.errors.length > 0) {
            toast.error(validation.errors[0]);
        }
        
        return validation;
    }
    
    /**
     * Get field validation CSS classes
     */
    static getFieldClasses(isValid, hasValue, touched = false) {
        const baseClasses = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-200";
        
        if (!touched && !hasValue) {
            return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
        }
        
        if (isValid) {
            return `${baseClasses} border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500`;
        } else {
            return `${baseClasses} border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500`;
        }
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
     * Comprehensive form validation
     */
    static validateForm(formData, fieldConfig = {}) {
        const errors = {};
        const sanitized = {};
        let isFormValid = true;
        
        Object.keys(formData).forEach(field => {
            const value = formData[field];
            const config = fieldConfig[field] || {};
            
            let validation;
            
            // Skip validation if field is not required and empty
            if (!config.required && (!value || value === '')) {
                sanitized[field] = value;
                return;
            }
            
            switch (field) {
                case 'name':
                    validation = this.validateName(value);
                    break;
                case 'email':
                    validation = this.validateEmail(value);
                    break;
                case 'password':
                case 'currentPassword':
                case 'newPassword':
                    validation = this.validatePassword(value, {
                        name: formData.name,
                        email: formData.email
                    });
                    break;
                case 'confirmPassword':
                    validation = this.validatePasswordConfirmation(value, formData.password || formData.newPassword);
                    break;
                case 'age':
                    validation = this.validateAge(value);
                    break;
                default:
                    // Generic validation for other fields
                    validation = this.validateGenericField(value, config);
            }
            
            if (!validation.isValid) {
                errors[field] = validation.errors;
                isFormValid = false;
            } else {
                sanitized[field] = validation.sanitized !== undefined ? validation.sanitized : value;
            }
        });
        
        return {
            isValid: isFormValid,
            errors,
            sanitized
        };
    }
    
    /**
     * Validate password confirmation
     */
    static validatePasswordConfirmation(confirmPassword, originalPassword) {
        const errors = [];
        
        if (!confirmPassword) {
            errors.push('Please confirm your password');
        } else if (confirmPassword !== originalPassword) {
            errors.push('Passwords do not match');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Generic field validation
     */
    static validateGenericField(value, config) {
        const errors = [];
        
        // Required check
        if (config.required && (!value || value.toString().trim() === '')) {
            errors.push(`${config.label || 'Field'} is required`);
        }
        
        // Min length check
        if (config.minLength && value && value.toString().length < config.minLength) {
            errors.push(`${config.label || 'Field'} must be at least ${config.minLength} characters long`);
        }
        
        // Max length check
        if (config.maxLength && value && value.toString().length > config.maxLength) {
            errors.push(`${config.label || 'Field'} cannot exceed ${config.maxLength} characters`);
        }
        
        // Pattern check
        if (config.pattern && value && !config.pattern.test(value.toString())) {
            errors.push(config.patternMessage || `${config.label || 'Field'} format is invalid`);
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitized: value ? this.sanitizeInput(value.toString()) : value
        };
    }
    
    /**
     * Display validation errors in a user-friendly way
     */
    static displayErrors(errors, showToast = true) {
        const allErrors = [];
        
        Object.keys(errors).forEach(field => {
            if (Array.isArray(errors[field])) {
                allErrors.push(...errors[field]);
            } else {
                allErrors.push(errors[field]);
            }
        });
        
        if (showToast && allErrors.length > 0) {
            // Show only the first error to avoid overwhelming the user
            toast.error(allErrors[0]);
        }
        
        return allErrors;
    }
}

export default ValidationUtils;