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

app.get('/', (req, res) => {
    res.send('It is working');
});

app.get('/health', (req, res) => {
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: 'ok',
        mongoose: stateMap[mongoose.connection.readyState] || mongoose.connection.readyState,
    });
});

async function connectDB() {
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI environment variable is not set!');
        console.error('Please check your .env file and ensure MONGO_URI is configured.');
        process.exit(1);
    }

    // Validate mongodb+srv URI does not include a port number
    try {
        if (typeof MONGO_URI === 'string' && MONGO_URI.startsWith('mongodb+srv://')) {
            const afterScheme = MONGO_URI.slice('mongodb+srv://'.length);
            const atIndex = afterScheme.indexOf('@');
            const hostAndBeyond = afterScheme.slice(atIndex >= 0 ? atIndex + 1 : 0);
            const endIdxCandidates = [hostAndBeyond.indexOf('/'), hostAndBeyond.indexOf('?')].filter(i => i >= 0);
            const endIdx = endIdxCandidates.length ? Math.min(...endIdxCandidates) : hostAndBeyond.length;
            const hostPart = hostAndBeyond.slice(0, endIdx);
            if (/:\d+/.test(hostPart)) {
                console.error('Invalid mongodb+srv URI: SRV format must NOT include a port (e.g., remove :27017).');
                console.error('Either:');
                console.error(' - Use mongodb+srv without any port, e.g. mongodb+srv://user:pass@cluster0.x.mongodb.net/DB?opts');
                console.error(' - Or switch to mongodb:// and specify hosts with ports if needed, e.g. mongodb://host1:27017,host2:27017/DB?replicaSet=...');
                return;
            }
            // Basic shape check for credentials separator '@'
            if (atIndex === -1) {
                console.warn('mongodb+srv URI looks malformed (missing "@" between credentials and host). Check your connection string.');
            }
        }
    } catch (e) {
        console.warn('Warning while validating MONGO_URI:', e?.message || e);
    }

    // Enhanced connection options for security and performance
    const connectionOptions = {
        // Security options
        authSource: 'admin', // Use admin database for authentication
        
        // Connection pool options for better performance
        maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
        minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
        
        // Timeout options
        serverSelectionTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        connectTimeoutMS: 10000, // 10 seconds
        
        // Monitoring and heartbeat
        heartbeatFrequencyMS: 10000, // 10 seconds
        
        // Additional security and reliability options
        retryWrites: true,
        w: 'majority', // Write concern for data durability
    };

    try {
        await mongoose.connect(MONGO_URI, connectionOptions);
        
        // Optional: ping to verify connection
        try {
            await mongoose.connection.db.admin().command({ ping: 1 });
            console.log('✅ MongoDB ping: OK');
        } catch (pingErr) {
            console.warn('⚠️ MongoDB ping failed:', pingErr?.message || pingErr);
        }
        
        console.log(`✅ Connected to MongoDB - Environment: ${process.env.NODE_ENV || 'development'}`);
        
        // Set up connection event listeners for better monitoring
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
        
    } catch (err) {
        // Provide helpful diagnostics for common Atlas auth issues
        const msg = err?.message || String(err);
        console.error('❌ Failed to connect to MongoDB:', msg);
        
        if (/mongodb\+srv URI cannot have port number/i.test(msg)) {
            console.error('Fix: Remove any :PORT from your mongodb+srv URI, or switch to mongodb:// with explicit hosts and ports.');
        }
        
        if (err?.codeName === 'AtlasError' || /bad auth|Authentication failed/i.test(msg)) {
            console.error('\n🔧 Troubleshooting tips for Atlas auth failures:');
            console.error('- Verify the username and password are correct.');
            console.error('- If your password contains special characters, URL-encode it or use encodeURIComponent when building the URI.');
            console.error('- Ensure your connection string includes the database name, e.g., ...mongodb.net/your_db_name');
            console.error('- Check your IP Access List in Atlas (allow your current IP or 0.0.0.0/0 for testing).');
            console.error('- Consider resetting the database user password in Atlas and updating the URI.');
        }
        
        // Don't exit in production, allow graceful degradation
        if (process.env.NODE_ENV === 'production') {
            console.error('⚠️ Starting server without database connection in production mode');
        } else {
            process.exit(1);
        }
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await mongoose.disconnect();
    process.exit(0);
});

// Start HTTP server immediately; attempt DB connection in background
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
connectDB();


