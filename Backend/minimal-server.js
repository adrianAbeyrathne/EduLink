const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import only the new routes to test
const resourceRouter = require('./Routes/ResourceRoutes');
const forumPostRouter = require('./Routes/ForumPostRoutes');

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

// Simple routes
app.get('/', (req, res) => {
    res.json({ message: 'Minimal server working!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: 'ok',
        mongoose: stateMap[mongoose.connection.readyState] || mongoose.connection.readyState,
    });
});

// Test with only one new route
app.use('/api/resources', resourceRouter);
app.use('/api/forum-posts', forumPostRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// MongoDB Connection
async function connectDB() {
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI environment variable is not set!');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB - Environment: development');
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
}

app.listen(PORT, () => {
    console.log(`Minimal test server running on http://localhost:${PORT}`);
    connectDB();
});