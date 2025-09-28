const Resource = require('../Model/Resource');
const mongoose = require('mongoose');

// Get all resources with pagination and filtering
const getAllResources = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.grade_level) filter.grade_level = req.query.grade_level;
    if (req.query.approval_status) filter.approval_status = req.query.approval_status;
    if (req.query.uploader) filter.uploader = req.query.uploader;

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    const resources = await Resource.find(filter)
      .populate('uploader', 'name email')
      .populate('approved_by', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments(filter);

    res.json({
      success: true,
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
};

// Get resource by ID
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploader', 'name email')
      .populate('approved_by', 'name')
      .populate('reviews.reviewer', 'name');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment view count
    await resource.incrementViewCount();

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource',
      error: error.message
    });
  }
};

// Create new resource
const createResource = async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      uploader: req.user?.id || req.body.uploader,
      created_by: req.user?.id || req.body.created_by
    };

    const resource = new Resource(resourceData);
    await resource.save();

    await resource.populate('uploader', 'name email');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create resource',
      error: error.message
    });
  }
};

// Update resource
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user has permission to update
    if (resource.uploader.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this resource'
      });
    }

    Object.assign(resource, req.body);
    resource.last_modified_by = req.user?.id;
    
    await resource.save();
    await resource.populate('uploader', 'name email');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update resource',
      error: error.message
    });
  }
};

// Delete resource
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user has permission to delete
    if (resource.uploader.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this resource'
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: error.message
    });
  }
};

// Approve resource (admin only)
const approveResource = async (req, res) => {
  try {
    const { admin_notes } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.approve(req.user?.id, admin_notes);

    res.json({
      success: true,
      message: 'Resource approved successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error approving resource:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to approve resource',
      error: error.message
    });
  }
};

// Reject resource (admin only)
const rejectResource = async (req, res) => {
  try {
    const { admin_notes } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.reject(req.user?.id, admin_notes);

    res.json({
      success: true,
      message: 'Resource rejected',
      data: resource
    });
  } catch (error) {
    console.error('Error rejecting resource:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to reject resource',
      error: error.message
    });
  }
};

// Add review to resource
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.addReview(req.user?.id, rating, comment);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// Get pending resources for approval
const getPendingResources = async (req, res) => {
  try {
    const resources = await Resource.findPendingApproval()
      .populate('uploader', 'name email');

    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching pending resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending resources',
      error: error.message
    });
  }
};

// Get popular resources
const getPopularResources = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const resources = await Resource.findPopular(limit)
      .populate('uploader', 'name');

    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching popular resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular resources',
      error: error.message
    });
  }
};

// Get resources by uploader
const getResourcesByUploader = async (req, res) => {
  try {
    const uploaderId = req.params.uploaderId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resources = await Resource.find({ uploader: uploaderId })
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments({ uploader: uploaderId });

    res.json({
      success: true,
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching resources by uploader:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources by uploader',
      error: error.message
    });
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  approveResource,
  rejectResource,
  addReview,
  getPendingResources,
  getPopularResources,
  getResourcesByUploader
};