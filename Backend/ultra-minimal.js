const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(express.json());
app.use(cors());

// Simple test routes
app.get('/', (req, res) => {
    console.log('Root endpoint called');
    res.json({ message: 'Ultra minimal server working!' });
});

app.get('/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ message: 'Test endpoint working!' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`Ultra minimal server running on http://localhost:${PORT}`);
});