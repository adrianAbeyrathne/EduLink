const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Import only essential routes
const authRouter = require('./Routes/AuthRoutes');
const userRouter = require('./Routes/UserRoutes');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edulink';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

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

async function connectDB() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        console.log('MongoDB URI:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//*****:*****@'));
        
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Connected to MongoDB successfully');
        
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        
        if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
            console.error('💡 Trying to use local MongoDB instead...');
            try {
                await mongoose.connect('mongodb://localhost:27017/edulink', {
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                });
                console.log('✅ Connected to local MongoDB successfully');
            } catch (localErr) {
                console.error('❌ Local MongoDB also failed:', localErr.message);
                console.error('💡 Please ensure MongoDB is running or check your connection string');
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down gracefully...');
    await mongoose.disconnect();
    process.exit(0);
});