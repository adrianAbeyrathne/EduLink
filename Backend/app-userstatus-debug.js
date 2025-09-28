const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

// Load environment variables FIRST
dotenv.config();

// Import passport config AFTER env variables are loaded
const passport = require('./config/passport');

// Import routes
const userRouter = require('./Routes/UserRoutes');
const roleRouter = require('./Routes/RoleRoutes');
const auditLogRouter = require('./Routes/AuditRoutes');
const passwordResetRouter = require('./Routes/ResetTokenRoutes');
const tutorVerificationRouter = require('./Routes/VerificationRoutes');
const authRouter = require('./Routes/AuthRoutes');

// Import new routes for the three modules
const resourceRouter = require('./Routes/ResourceRoutes');
const forumPostRouter = require('./Routes/ForumPostRoutes');
const sessionRouter = require('./Routes/SessionRoutes');
const bookingRouter = require('./Routes/BookingRoutes');
const paymentRouter = require('./Routes/PaymentRoutes');
const notificationRouter = require('./Routes/NotificationRoutes');
const invoiceRouter = require('./Routes/InvoiceRoutes');

// Import External CRUD routes
const externalUserRouter = require('./ExternalCRUD/routes/ExternalUserRoutes');

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Enhanced request logging middleware for userStatus debugging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📝 ${timestamp} - ${req.method} ${req.url}`);
    
    // Special logging for user updates
    if (req.method === 'PUT' && req.url.includes('/api/users/')) {
        console.log('🔄 USER UPDATE REQUEST:');
        console.log('  - URL:', req.url);
        console.log('  - Body:', JSON.stringify(req.body, null, 2));
        console.log('  - Content-Type:', req.get('Content-Type'));
        
        // Log specifically for userStatus updates
        if (req.body && req.body.userStatus) {
            console.log(`🎯 USERSTATUS UPDATE DETECTED: "${req.body.userStatus}"`);
        }
    }
    
    // Track response
    const originalSend = res.send;
    res.send = function(data) {
        if (req.method === 'PUT' && req.url.includes('/api/users/')) {
            console.log(`✅ USER UPDATE Response - Status: ${res.statusCode}`);
            try {
                const responseData = JSON.parse(data);
                if (responseData.users && responseData.users.userStatus) {
                    console.log(`🎯 RETURNED USERSTATUS: "${responseData.users.userStatus}"`);
                }
            } catch (e) {
                console.log(`📄 Response data: ${data.substring(0, 200)}...`);
            }
        }
        return originalSend.call(this, data);
    };
    
    next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? FRONTEND_URL : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'],
    credentials: true
}));

// Session configuration for Google OAuth - MUST come before passport
app.use(session({
    secret: process.env.JWT_SECRET || 'fallback-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport AFTER session middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files for testing
app.use(express.static(__dirname));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Routes
console.log('🔄 Mounting routes...');
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/roles', roleRouter);
app.use('/audit-logs', auditLogRouter);
app.use('/password-reset', passwordResetRouter);
app.use('/tutor-verification', tutorVerificationRouter);

// New API routes for the three modules
app.use('/api/resources', resourceRouter);
app.use('/api/forum-posts', forumPostRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/invoices', invoiceRouter);

// External CRUD routes
app.use('/api', externalUserRouter);
console.log('✅ Routes mounted successfully');

app.get('/', (req, res) => {
    console.log('✅ Root route hit');
    res.json({ 
        message: 'EduLink Backend Server - UserStatus Debug Mode', 
        timestamp: new Date().toISOString(),
        routes: {
            auth: '/api/auth',
            google: '/api/auth/google',
            health: '/health'
        }
    });
});

app.get('/health', (req, res) => {
    console.log('💚 Health check requested');
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongoose: stateMap[mongoose.connection.readyState] || mongoose.connection.readyState,
        passport: {
            strategies: Object.keys(passport._strategies || {}),
            hasGoogle: !!passport._strategies?.google
        }
    };
    res.json(health);
});

async function connectDB() {
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI environment variable is not set!');
        console.error('Please check your .env file and ensure MONGO_URI is configured.');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, {
            authSource: 'admin',
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        });

        console.log('✅ MongoDB connected successfully');
        
        // Test the connection
        const admin = mongoose.connection.db.admin();
        const result = await admin.ping();
        console.log('✅ MongoDB ping: OK');

    } catch (err) {
        const msg = err?.message || String(err);
        console.error('❌ Failed to connect to MongoDB:', msg);
        
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await mongoose.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await mongoose.disconnect();
    process.exit(0);
});

// Start HTTP server first, then connect to DB
app.listen(PORT, () => {
    console.log(`🚀 DEBUG SERVER running on http://localhost:${PORT}`);
    console.log(`🎯 Test Google OAuth: http://localhost:${PORT}/api/auth/google`);
    console.log(`🎯 Test health: http://localhost:${PORT}/health`);
    console.log(`🔍 UserStatus debugging enabled`);
    connectDB();
});