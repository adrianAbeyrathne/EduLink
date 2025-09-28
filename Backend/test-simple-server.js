const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/', (req, res) => {
    console.log('Request received for /');
    res.json({ message: 'Simple test server is working!' });
});

app.get('/health', (req, res) => {
    console.log('Request received for /health');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Simple test server running on http://localhost:${PORT}`);
    console.log(`🎯 Test it with: http://localhost:${PORT}/health`);
});

// Prevent immediate shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});