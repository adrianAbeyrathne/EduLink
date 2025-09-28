const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import and configure Passport
const passport = require('./config/passport');

// Import routes
const userRouter = require('./Routes/UserRoutes');
const authRouter = require('./Routes/AuthRoutes');

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Session configuration - Required for Google OAuth
app.use(session({
    secret: process.env.JWT_SECRET || 'fallback-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.json({ message: 'EduLink API is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: 'ok',
        mongoose: stateMap[mongoose.connection.readyState] || mongoose.connection.readyState,
    });
});

// MongoDB Connection with better error handling
async function connectDB() {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        console.log('🔄 Attempting to connect to MongoDB...');
        
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Connected to MongoDB successfully');
        
        // Test the connection with a simple ping
        await mongoose.connection.db.admin().ping();
        console.log('✅ MongoDB ping successful');

        // Set up connection monitoring
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n📝 Shutting down gracefully...');
    await mongoose.disconnect();
    process.exit(0);
});