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
app.use(express.json({ limit: '10mb' }));

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
        
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('🎉 Backend startup completed successfully!');
        });

        // Handle server shutdown gracefully - only for production
        if (process.env.NODE_ENV === 'production') {
            process.on('SIGTERM', () => {
                console.log('🛑 SIGTERM received, shutting down gracefully...');
                server.close(() => {
                    mongoose.disconnect();
                    process.exit(0);
                });
            });

            process.on('SIGINT', () => {
                console.log('🛑 SIGINT received, shutting down gracefully...');
                server.close(() => {
                    mongoose.disconnect();
                    process.exit(0);
                });
            });
        } else {
            console.log('🔧 Development mode - server will stay running');
        }

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();