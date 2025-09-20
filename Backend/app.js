const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const router = require('./Routes/UserRoutes');

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

// Routes
app.use('/users',router);

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
    try {
        await mongoose.connect(MONGO_URI);
        // Optional: ping to verify connection
        try {
            await mongoose.connection.db.admin().command({ ping: 1 });
            console.log('MongoDB ping: OK');
        } catch (pingErr) {
            console.warn('MongoDB ping failed:', pingErr?.message || pingErr);
        }
        console.log('Connected to MongoDB');
    } catch (err) {
        // Provide helpful diagnostics for common Atlas auth issues
        const msg = err?.message || String(err);
        console.error('Failed to connect to MongoDB:', msg);
        if (/mongodb\+srv URI cannot have port number/i.test(msg)) {
            console.error('Fix: Remove any :PORT from your mongodb+srv URI, or switch to mongodb:// with explicit hosts and ports.');
        }
        if (err?.codeName === 'AtlasError' || /bad auth|Authentication failed/i.test(msg)) {
            console.error('\nTroubleshooting tips for Atlas auth failures:');
            console.error('- Verify the username and password are correct.');
            console.error('- If your password contains special characters, URL-encode it or use encodeURIComponent when building the URI.');
            console.error('- Ensure your connection string includes the database name, e.g., ...mongodb.net/your_db_name');
            console.error('- Check your IP Access List in Atlas (allow your current IP or 0.0.0.0/0 for testing).');
            console.error('- Consider resetting the database user password in Atlas and updating the URI.');
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


