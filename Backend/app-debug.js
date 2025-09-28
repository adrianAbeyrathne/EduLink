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

// Enhanced request logging middleware with detailed callback tracking
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📝 ${timestamp} - ${req.method} ${req.url}`);
    
    // Special logging for OAuth callbacks
    if (req.url.includes('google/callback')) {
        console.log('🎯 GOOGLE OAUTH CALLBACK DETECTED:');
        console.log('  - URL:', req.url);
        console.log('  - Query params:', JSON.stringify(req.query, null, 2));
        console.log('  - Headers User-Agent:', req.get('User-Agent'));
        console.log('  - Headers Referer:', req.get('Referer'));
    }
    
    // Track response
    const originalSend = res.send;
    res.send = function(data) {
        console.log(`✅ Response sent for ${req.method} ${req.url} - Status: ${res.statusCode}`);
        return originalSend.call(this, data);
    };
    
    const originalRedirect = res.redirect;
    res.redirect = function(url) {
        console.log(`🔄 Redirecting ${req.method} ${req.url} to: ${url}`);
        return originalRedirect.call(this, url);
    };
    
    next();
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error(`❌ ERROR in ${req.method} ${req.url}:`, err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Internal server error', details: err.message });
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

// Enhanced health check endpoint
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
        },
        server: {
            port: PORT,
            frontend_url: FRONTEND_URL,
            node_env: process.env.NODE_ENV,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        }
    };
    console.log('💚 Health check response:', JSON.stringify(health, null, 2));
    res.json(health);
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
        message: 'EduLink Backend Server - Debug Mode', 
        timestamp: new Date().toISOString(),
        routes: {
            auth: '/api/auth',
            google: '/api/auth/google',
            health: '/health'
        }
    });
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

// Enhanced graceful shutdown
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

process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Start HTTP server first, then connect to DB
app.listen(PORT, () => {
    console.log(`🚀 DEBUG SERVER running on http://localhost:${PORT}`);
    console.log(`🎯 Test Google OAuth: http://localhost:${PORT}/api/auth/google`);
    console.log(`🎯 Test status: http://localhost:${PORT}/api/auth/google/status`);
    console.log(`🎯 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Enhanced logging enabled for OAuth debugging`);
    connectDB();
});