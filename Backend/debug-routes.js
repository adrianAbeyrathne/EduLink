const express = require('express');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = 5001; // Use different port to avoid conflicts

// Middleware
app.use(express.json());

// Add logging middleware to see all requests
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log(`📝 Headers: ${JSON.stringify(req.headers, null, 2)}`);
    next();
});

// Test routes to verify routing works
app.get('/test', (req, res) => {
    console.log('✅ Test route hit');
    res.json({ message: 'Test route working', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
    console.log('✅ API test route hit');
    res.json({ message: 'API test route working', timestamp: new Date().toISOString() });
});

// Import and use auth routes
try {
    console.log('🔄 Loading AuthRoutes...');
    const authRouter = require('./Routes/AuthRoutes');
    app.use('/api/auth', authRouter);
    console.log('✅ AuthRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading AuthRoutes:', error.message);
}

app.listen(PORT, () => {
    console.log(`🚀 Debug server running on http://localhost:${PORT}`);
    console.log(`🔍 Test routes:`);
    console.log(`   http://localhost:${PORT}/test`);
    console.log(`   http://localhost:${PORT}/api/test`);
    console.log(`   http://localhost:${PORT}/api/auth/google/status`);
    console.log(`   http://localhost:${PORT}/api/auth/google`);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Debug server shutting down...');
    process.exit(0);
});