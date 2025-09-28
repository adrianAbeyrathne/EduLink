const Resource = require('../Model/ResourceModel');

const getResources = async (req, res) => {
    try {
        const resources = await Resource.find();
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addResource = async (req, res) => {
    const { title, description, subject, topic, file_type, file_url, tags } = req.body;

    const newResource = new Resource({
        title,
        description,
        subject,
        topic,
        file_type,
        file_url,
        tags
    });

    try {
        const savedResource = await newResource.save();
        res.status(201).json(savedResource);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getResources, addResource };
