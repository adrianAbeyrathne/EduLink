// Debug script to check passport configuration
require('dotenv').config();
console.log('=== Environment Variables Debug ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Not Found');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Found' : 'Not Found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Not Found');

console.log('\n=== Passport Configuration Test ===');
const passport = require('./config/passport');

console.log('Available strategies:', Object.keys(passport._strategies || {}));
console.log('Google strategy exists:', passport._strategies ? 'google' in passport._strategies : 'No strategies found');

// Test strategy registration manually
if (passport._strategies && passport._strategies.google) {
    console.log('✅ Google strategy is properly registered');
} else {
    console.log('❌ Google strategy is NOT registered');
    console.log('Available strategies:', Object.keys(passport._strategies || {}));
}