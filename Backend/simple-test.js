const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Different port to test

// Simple middleware
app.use(express.json());
app.use(cors());

// Simple route
app.get('/', (req, res) => {
    res.json({ message: 'Test server working!', port: PORT });
});

app.get('/test', (req, res) => {
    res.json({ message: 'API endpoint working!', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Simple test server running on http://localhost:${PORT}`);
});