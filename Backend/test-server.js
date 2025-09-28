const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? FRONTEND_URL : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Simple test routes
app.get('/', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        message: "✅ Server is healthy!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'
    });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API endpoint working!', timestamp: new Date().toISOString() });
});

// MongoDB Connection
async function connectDB() {
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI environment variable is not set!');
        console.error('Please check your .env file and ensure MONGO_URI is configured.');
        process.exit(1);
    }

    try {
        console.log('🔄 Attempting to connect to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI);
        
        console.log('Server running on http://localhost:' + PORT);
        console.log('✅ MongoDB ping: OK');
        console.log(`✅ Connected to MongoDB - Environment: ${process.env.NODE_ENV || 'development'}`);
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
        
    } catch (err) {
        const msg = err?.message || String(err);
        console.error('❌ Failed to connect to MongoDB:', msg);
        process.exit(1);
    }
}

// Start server and connect to database
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    connectDB();
});