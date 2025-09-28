const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

dotenv.config();

// Import passport AFTER dotenv.config() to ensure environment variables are loaded
const passport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Basic middleware first
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration for Google OAuth - MUST come before passport
app.use(session({
    secret: process.env.JWT_SECRET || 'your-session-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    name: 'edulink.session.id' // Custom session name
}));

// Initialize Passport AFTER session middleware
app.use(passport.initialize());
app.use(passport.session());

// Enhanced CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 
        'http://localhost:3005', 'http://localhost:3010',
        'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002',
        'http://127.0.0.1:3005', 'http://127.0.0.1:3010'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check route
app.get('/', (req, res) => {
    res.json({ 
        message: 'EduLink Backend Server is running!',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Import and use routes
try {
    const userRouter = require('./Routes/UserRoutes');
    const authRouter = require('./Routes/AuthRoutes');
    
    app.use('/api/users', userRouter);
    app.use('/api/auth', authRouter);
    
    console.log('✅ Routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading routes:', error.message);
}

// MongoDB connection
async function connectDB() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

// Start server
async function startServer() {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('🎉 Backend startup completed successfully!');
            console.log('🔧 Server is running in persistent mode - use Ctrl+C to stop');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Only handle explicit shutdown requests
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received - shutting down...');
    process.exit(0);
});

// Add comprehensive error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process - keep the server running
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Don't exit the process - keep the server running
});

// Keep server running
console.log('🚀 Starting EduLink Backend Server...');
startServer();