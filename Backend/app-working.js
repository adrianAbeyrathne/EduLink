const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url} - Content-Type: ${req.headers['content-type']}`);
    next();
});

app.use(express.json({ limit: '10mb' }));

// Middleware to log parsed body
app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('📦 Parsed body:', req.body);
        console.log('📦 Body keys:', Object.keys(req.body || {}));
        console.log('📦 Body type:', typeof req.body);
    }
    next();
});

// Enhanced CORS configuration for frontend-backend communication
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
        message: 'EduLink Backend API is running!',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: 'ok',
        mongoose: stateMap[mongoose.connection.readyState] || mongoose.connection.readyState,
        timestamp: new Date().toISOString()
    });
});

// Try to load routes one by one safely
let authRouter, userRouter;

try {
    console.log('Loading AuthRoutes...');
    authRouter = require('./Routes/AuthRoutes');
    app.use('/api/auth', authRouter);
    console.log('✅ AuthRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading AuthRoutes:', error.message);
}

try {
    console.log('Loading UserRoutes...');
    userRouter = require('./Routes/UserRoutes');
    app.use('/api/users', userRouter);
    // Also support /users for Postman compatibility
    app.use('/users', userRouter);
    console.log('✅ UserRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading UserRoutes:', error.message);
}

// MongoDB connection
async function connectDB() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
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
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down gracefully...');
    await mongoose.disconnect();
    process.exit(0);
});

// Start the server
startServer();