const express = require('express');
const { getResources, addResource } = require('../Controllers/ResourceController');

const router = express.Router();

router.get('/', getResources);
router.post('/', addResource);

// Health check for resources
router.get('/health', (req, res) => {
	res.json({ status: 'ok', message: 'Resource routes are working' });
});

// Improved error handling for resource endpoints
router.get('/', async (req, res) => {
	try {
		await getResources(req, res);
	} catch (err) {
		console.error('Error in GET /resources:', err);
		res.status(500).json({ message: 'Internal server error' });
	}
});

router.post('/', async (req, res) => {
	try {
		await addResource(req, res);
	} catch (err) {
		console.error('Error in POST /resources:', err);
		res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;
