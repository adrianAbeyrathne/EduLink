const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🔄 Starting basic test server...');

// Basic middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Basic health check route
app.get('/health', (req, res) => {
    console.log('📍 Health check requested');
    res.json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        message: 'Basic test server is running!'
    });
});

// Basic users route for testing
app.get('/api/users', (req, res) => {
    console.log('📍 Users API requested');
    res.json({ 
        message: 'Users API is working',
        users: [
            { id: 1, name: 'Test User 1', email: 'test1@example.com' },
            { id: 2, name: 'Test User 2', email: 'test2@example.com' }
        ]
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Basic test server running on http://localhost:${PORT}`);
    console.log('🎉 Ready to accept requests!');
});

// Keep alive
setInterval(() => {
    console.log('💓 Server heartbeat - uptime:', Math.floor(process.uptime()), 'seconds');
}, 30000);

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

console.log('✅ Basic server setup complete!');