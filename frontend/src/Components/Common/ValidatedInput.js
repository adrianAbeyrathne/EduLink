import React, { useState, useEffect } from 'react';
import ValidationUtils from '../../utils/ValidationUtils';

const ValidatedInput = ({
    type = 'text',
    name,
    value = '',
    onChange,
    onBlur,
    placeholder,
    label,
    required = false,
    disabled = false,
    autoComplete,
    showValidation = true,
    userInfo = {},
    className = '',
    ...props
}) => {
    const [touched, setTouched] = useState(false);
    const [validation, setValidation] = useState({ 
        isValid: true, 
        errors: [], 
        warnings: [], 
        suggestions: [],
        strength: 0 
    });
    
    // Real-time validation
    useEffect(() => {
        if (value || touched) {
            const result = ValidationUtils.validateFormField(name, value, userInfo);
            // Ensure all properties are present
            setValidation({
                isValid: result.isValid,
                errors: result.errors || [],
                warnings: result.warnings || [],
                suggestions: result.suggestions || [],
                strength: result.strength || 0
            });
        }
    }, [value, name, userInfo, touched]);
    
    const handleBlur = (e) => {
        setTouched(true);
        if (onBlur) onBlur(e);
    };
    
    const fieldClasses = ValidationUtils.getFieldClasses(
        validation.isValid, 
        !!value, 
        touched
    );
    
    const renderPasswordStrength = () => {
        if (type !== 'password' || !value) return null;
        
        const strengthInfo = ValidationUtils.getPasswordStrengthInfo(validation.strength);
        const strengthWidth = (validation.strength / 5) * 100;
        
        return (
            <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">Password Strength</span>
                    <span 
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{ 
                            color: strengthInfo.color,
                            backgroundColor: strengthInfo.bgColor
                        }}
                    >
                        {strengthInfo.label}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${strengthWidth}%`,
                            backgroundColor: strengthInfo.color
                        }}
                    />
                </div>
                
                {/* Show suggestions */}
                {validation.suggestions && validation.suggestions.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Suggestions:</p>
                        <ul className="text-xs text-gray-500">
                            {validation.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };
    
    const renderValidationFeedback = () => {
        if (!showValidation || (!touched && !value)) return null;
        
        return (
            <div className="mt-1">
                {/* Errors */}
                {validation.errors && validation.errors.length > 0 && (
                    <div className="text-red-600">
                        {validation.errors.map((error, index) => (
                            <p key={index} className="text-xs flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        ))}
                    </div>
                )}
                
                {/* Warnings */}
                {validation.warnings && validation.warnings.length > 0 && validation.errors.length === 0 && (
                    <div className="text-yellow-600">
                        {validation.warnings.map((warning, index) => (
                            <p key={index} className="text-xs flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {warning}
                            </p>
                        ))}
                    </div>
                )}
                
                {/* Success */}
                {validation.isValid && touched && value && (
                    <p className="text-green-600 text-xs flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Looks good!
                    </p>
                )}
            </div>
        );
    };
    
    return (
        <div className={`relative ${className}`}>
            {label && (
                <label 
                    htmlFor={name} 
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className={`${fieldClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    {...props}
                />
                
                {/* Validation icon */}
                {showValidation && touched && value && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {validation.isValid ? (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                )}
            </div>
            
            {renderPasswordStrength()}
            {renderValidationFeedback()}
        </div>
    );
};

export default ValidatedInput;