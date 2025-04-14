/**
 * Validation Utilities
 * 
 * Server-side validation functions for payment processing, user management, and SSR
 * Enhanced with MatrixCMS validation patterns
 */

// Import phone service for enhanced validation
const phoneService = require('../services/phoneService');
const { BadRequestError } = require('./error');

// Validate payment-related data
const validatePaymentData = (data) => {
  const errors = [];
  // Validate firstName
  if (!data.firstName || typeof data.firstName !== 'string') {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (data.firstName.trim().length < 1) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (data.firstName.trim().length > 50) {
    errors.push({ field: 'firstName', message: 'First name cannot exceed 50 characters' });
  }
  
  // Validate lastName
  if (!data.lastName || typeof data.lastName !== 'string') {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (data.lastName.trim().length < 1) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (data.lastName.trim().length > 50) {
    errors.push({ field: 'lastName', message: 'Last name cannot exceed 50 characters' });
  }
  
  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email address is required' });
  }
  
  // Validate phone - using enhanced phoneService
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (data.countryCode && !validateInternationalPhone(data.phone, data.countryCode)) {
    errors.push({ field: 'phone', message: 'Valid phone number is required for the selected country' });
  } else if (!data.countryCode && !isValidPhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Valid phone number is required' });
  }
  
  return errors;
};

// Validate credit card data
const validateCreditCardData = (data) => {
  const errors = [];
  
  // Validate card number
  if (!data.cardNumber || typeof data.cardNumber !== 'string') {
    errors.push({ field: 'cardNumber', message: 'Card number is required' });
  } else if (!isValidCreditCardNumber(data.cardNumber)) {
    errors.push({ field: 'cardNumber', message: 'Valid card number is required' });
  }
  
  // Validate expiry date
  if (!data.expiryDate || typeof data.expiryDate !== 'string') {
    errors.push({ field: 'expiryDate', message: 'Expiry date is required' });
  } else if (!isValidExpiryDate(data.expiryDate)) {
    errors.push({ field: 'expiryDate', message: 'Valid expiry date is required (MM/YY)' });
  }
  
  // Validate CVV
  if (!data.cvv || typeof data.cvv !== 'string') {
    errors.push({ field: 'cvv', message: 'CVV is required' });
  } else if (!isValidCVV(data.cvv)) {
    errors.push({ field: 'cvv', message: 'Valid CVV is required (3-4 digits)' });
  }
  
  // Validate cardholder name
  if (!data.cardholderName || typeof data.cardholderName !== 'string') {
    errors.push({ field: 'cardholderName', message: 'Cardholder name is required' });
  } else if (data.cardholderName.trim().length < 2) {
    errors.push({ field: 'cardholderName', message: 'Valid cardholder name is required' });
  }
  
  return errors;
};

/**
 * Validate international phone number using phoneService
 * @param {string} phone - The phone number to validate
 * @param {string} countryCode - Country code like 'US', 'AU', etc.
 * @returns {boolean} - Whether phone is valid for this country
 */
const validateInternationalPhone = (phone, countryCode) => {
  try {
    // Delegate to phoneService for proper international validation
    return phoneService.validatePhoneNumber(phone, countryCode);
  } catch (error) {
    console.error('Error validating international phone:', error);
    // Fall back to basic validation if phone service fails
    return isValidPhone(phone);
  }
};

/**
 * Format a phone number to E.164 standard for consistent storage
 * @param {string} phone - The phone number to format
 * @param {string} countryCode - Country code like 'US', 'AU', etc.
 * @returns {string} - Formatted phone number or original if couldn't format
 */
const formatPhoneE164 = (phone, countryCode) => {
  try {
    // Delegate to phoneService for proper E.164 formatting
    return phoneService.formatPhoneE164(phone, countryCode);
  } catch (error) {
    console.error('Error formatting phone to E.164:', error);
    // Return original if can't format
    return phone;
  }
};

// Validate email format
const isValidEmail = (email) => {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (basic method - use validateInternationalPhone for better validation)
const isValidPhone = (phone) => {
  // Phone should contain only digits and have between 5 and 15 characters
  return /^\d{5,15}$/.test(phone.replace(/\D/g, ''));
};

// Validate credit card number (basic Luhn algorithm)
const isValidCreditCardNumber = (cardNumber) => {
  // Remove non-digit characters
  const cleanCardNumber = cardNumber.replace(/\D/g, '');
  
  // Check length (typical card numbers are 13-19 digits)
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    return false;
  }
  
  // Luhn algorithm (mod 10 check)
  let sum = 0;
  let shouldDouble = false;
  
  // Loop from right to left
  for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanCardNumber.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return (sum % 10) === 0;
};

// Validate expiry date (MM/YY format)
const isValidExpiryDate = (expiryDate) => {
  // Check format
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false;
  }
  
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  
  // Convert to numbers
  const numMonth = parseInt(month, 10);
  const numYear = parseInt(year, 10);
  
  // Check valid month
  if (numMonth < 1 || numMonth > 12) {
    return false;
  }
  
  // Check if expired
  if (numYear < currentYear || (numYear === currentYear && numMonth < currentMonth)) {
    return false;
  }
  
  return true;
};

// Validate CVV (3-4 digits)
const isValidCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Safely parse JSON with error handling
 * @param {string} str - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} - Parsed object or fallback value
 */
const safeJsonParse = (str, fallback = {}) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return fallback;
  }
};

/**
 * Clean user input to prevent XSS and other injection attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
};

/**
 * Validate that all required fields are present in the request body
 * @param {object} body - Request body to validate
 * @param {Array<string>} requiredFields - Array of field names that are required
 * @throws {BadRequestError} If any required field is missing
 */
const validateRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    throw BadRequestError(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @param {number} options.minLength - Minimum password length (default: 8)
 * @param {boolean} options.requireLowercase - Whether lowercase letters are required (default: true)
 * @param {boolean} options.requireUppercase - Whether uppercase letters are required (default: true)
 * @param {boolean} options.requireNumbers - Whether numbers are required (default: true)
 * @param {boolean} options.requireSpecialChars - Whether special characters are required (default: true)
 * @returns {object} - Validation result with isValid and message properties
 */
const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireLowercase = true,
    requireUppercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;
  
  const result = {
    isValid: true,
    message: 'Password is valid'
  };
  
  if (!password || password.length < minLength) {
    result.isValid = false;
    result.message = `Password must be at least ${minLength} characters long`;
    return result;
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.message = 'Password must contain at least one lowercase letter';
    return result;
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.message = 'Password must contain at least one uppercase letter';
    return result;
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    result.isValid = false;
    result.message = 'Password must contain at least one number';
    return result;
  }
  
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.isValid = false;
    result.message = 'Password must contain at least one special character';
    return result;
  }
  
  return result;
};

module.exports = {
  // Original validators
  validatePaymentData,
  validateCreditCardData,
  isValidEmail,
  isValidPhone,
  validateInternationalPhone,
  formatPhoneE164,
  isValidCreditCardNumber,
  isValidExpiryDate,
  isValidCVV,
  safeJsonParse,
  sanitizeInput,
  
  // MatrixCMS pattern validators
  validateRequiredFields,
  validatePassword
};