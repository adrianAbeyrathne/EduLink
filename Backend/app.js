require('dotenv').config(); // must be first line

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const router = require('./Routes/UserRoutes');
const resourceRoutes = require('./Routes/ResourceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// --------------------
// Middleware
// --------------------
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? FRONTEND_URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// --------------------
// Routes
// --------------------
app.use('/users', router);
app.use('/resources', resourceRoutes);

app.get('/', (req, res) => {
    res.send('It is working');
});

// --------------------
// Health check (ping the DB)
// --------------------
app.get('/health', async (req, res) => {
    let dbStatus = 'disconnected';

    if (mongoose.connection.readyState === 1) { // connected
        try {
            await mongoose.connection.db.admin().ping();
            dbStatus = 'connected';
        } catch (err) {
            dbStatus = 'disconnected';
        }
    } else if (mongoose.connection.readyState === 2) {
        dbStatus = 'connecting';
    } else if (mongoose.connection.readyState === 3) {
        dbStatus = 'disconnecting';
    }

    res.json({
        status: 'ok',
        mongoose: dbStatus
    });
});

// --------------------
// Connect to MongoDB and start server
// --------------------
async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

// --------------------
// Graceful shutdown
// --------------------
process.on('SIGINT', async () => {
    await mongoose.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await mongoose.disconnect();
    process.exit(0);
});

// Start server
startServer();
