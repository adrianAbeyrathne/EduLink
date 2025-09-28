const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../Model/UserModel');

console.log('🔄 Initializing Passport configuration...');

// Serialize user for session
passport.serializeUser((user, done) => {
    console.log('🔄 Serializing user:', user._id);
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        console.log('🔄 Deserializing user:', id);
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error('❌ Error deserializing user:', error);
        done(error, null);
    }
});

// Always register Google OAuth Strategy (with proper error handling)
console.log('🔄 Registering Google OAuth Strategy...');
passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('🔍 Google OAuth Strategy called');
        
        // Check if Google OAuth is properly configured
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            console.error('❌ Google OAuth credentials not configured');
            return done(new Error('Google OAuth is not properly configured'), null);
        }

        console.log('🔍 Google OAuth Profile:', {
            id: profile.id,
            name: profile.displayName,
            email: profile.emails[0]?.value,
            picture: profile.photos[0]?.value
        });

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // User exists with Google ID
            console.log('✅ Existing Google user found:', user.email);
            return done(null, user);
        }

        // Check if user exists with this email (for linking accounts)
        user = await User.findOne({ email: profile.emails[0]?.value });

        if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.profilePic = user.profilePic || profile.photos[0]?.value;
            user.authProvider = 'google';
            await user.save();
            console.log('🔗 Linked Google account to existing user:', user.email);
            return done(null, user);
        }

        // Create new user
        const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0]?.value,
            role: 'student', // Default role for Google sign-ups
            age: 18, // Default age
            profilePic: profile.photos[0]?.value,
            isVerified: true, // Google accounts are pre-verified
            status: 'active',
            authProvider: 'google'
        });

        await newUser.save();
        console.log('✅ New Google user created:', newUser.email);
        return done(null, newUser);

    } catch (error) {
        console.error('❌ Google OAuth Error:', error);
        return done(error, null);
    }
}));

// Always register JWT Strategy
console.log('🔄 Registering JWT Strategy...');
passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
}, async (payload, done) => {
    try {
        console.log('🔍 JWT Strategy called for user:', payload.id);
        const user = await User.findById(payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        console.error('❌ JWT Strategy Error:', error);
        return done(error, false);
    }
}));

// Log strategy registration status
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Google OAuth strategy configured with valid credentials');
} else {
    console.log('⚠️  Google OAuth strategy registered but credentials are missing');
}

if (process.env.JWT_SECRET) {
    console.log('✅ JWT strategy configured');
} else {
    console.log('⚠️  JWT_SECRET not found - using fallback secret');
}

// Verify strategies are registered
console.log('🔍 Registered strategies:', Object.keys(passport._strategies || {}));

console.log('✅ Passport configuration completed');

module.exports = passport;