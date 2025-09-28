const TutorVerification = require('../Model/TutorVerification');
const User = require('../Model/User');

// Get all tutor verifications
const getAllVerifications = async (req, res) => {
    const ready = TutorVerification.db.readyState;
    if (ready !== 1) {
        return res.status(503).json({ message: 'Database not connected', readyState: ready });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status; // Filter by status if provided

        const filter = status ? { status } : {};

        const verifications = await TutorVerification.find(filter)
            .populate('user', 'name email phone')
            .populate('verified_by_admin', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await TutorVerification.countDocuments(filter);

        return res.status(200).json({ 
            verifications, 
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching tutor verifications:', err);
        return res.status(500).json({ message: 'Failed to fetch tutor verifications' });
    }
};

// Submit tutor verification
const submitVerification = async (req, res) => {
    const { userId, qualification, id_document_url } = req.body;

    try {
        // Check if user already has a verification request
        const existingVerification = await TutorVerification.findOne({ user: userId });
        if (existingVerification) {
            return res.status(400).json({ message: 'Verification request already exists' });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verification = new TutorVerification({
            user: userId,
            qualification,
            id_document_url,
            status: 'Pending'
        });

        await verification.save();

        const populatedVerification = await TutorVerification.findById(verification._id)
            .populate('user', 'name email phone');

        return res.status(201).json({ verification: populatedVerification });
    } catch (err) {
        console.error('Error submitting verification:', err);
        return res.status(500).json({ message: 'Failed to submit verification' });
    }
};

// Get verification by ID
const getVerificationById = async (req, res) => {
    const { id } = req.params;

    try {
        const verification = await TutorVerification.findById(id)
            .populate('user', 'name email phone')
            .populate('verified_by_admin', 'name email');

        if (!verification) {
            return res.status(404).json({ message: 'Verification not found' });
        }

        return res.status(200).json({ verification });
    } catch (err) {
        console.error('Error fetching verification:', err);
        return res.status(500).json({ message: 'Failed to fetch verification' });
    }
};

// Get verification by user ID
const getVerificationByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const verification = await TutorVerification.findOne({ user: userId })
            .populate('user', 'name email phone')
            .populate('verified_by_admin', 'name email');

        if (!verification) {
            return res.status(404).json({ message: 'No verification found for this user' });
        }

        return res.status(200).json({ verification });
    } catch (err) {
        console.error('Error fetching user verification:', err);
        return res.status(500).json({ message: 'Failed to fetch user verification' });
    }
};

// Update verification status (admin only)
const updateVerificationStatus = async (req, res) => {
    const { id } = req.params;
    const { status, adminId } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be Pending, Approved, or Rejected' });
    }

    try {
        const verification = await TutorVerification.findByIdAndUpdate(
            id,
            { 
                status,
                verified_by_admin: adminId || null
            },
            { new: true }
        ).populate('user', 'name email phone')
         .populate('verified_by_admin', 'name email');

        if (!verification) {
            return res.status(404).json({ message: 'Verification not found' });
        }

        return res.status(200).json({ verification });
    } catch (err) {
        console.error('Error updating verification status:', err);
        return res.status(500).json({ message: 'Failed to update verification status' });
    }
};

// Update verification details
const updateVerification = async (req, res) => {
    const { id } = req.params;
    const { qualification, id_document_url } = req.body;

    try {
        const verification = await TutorVerification.findById(id);
        if (!verification) {
            return res.status(404).json({ message: 'Verification not found' });
        }

        // Only allow updates if status is Pending or Rejected
        if (verification.status === 'Approved') {
            return res.status(400).json({ message: 'Cannot update approved verification' });
        }

        const updatedVerification = await TutorVerification.findByIdAndUpdate(
            id,
            { 
                qualification,
                id_document_url,
                status: 'Pending' // Reset to pending when updated
            },
            { new: true }
        ).populate('user', 'name email phone')
         .populate('verified_by_admin', 'name email');

        return res.status(200).json({ verification: updatedVerification });
    } catch (err) {
        console.error('Error updating verification:', err);
        return res.status(500).json({ message: 'Failed to update verification' });
    }
};

// Delete verification
const deleteVerification = async (req, res) => {
    const { id } = req.params;

    try {
        const verification = await TutorVerification.findByIdAndDelete(id);
        if (!verification) {
            return res.status(404).json({ message: 'Verification not found' });
        }

        return res.status(200).json({ message: 'Verification deleted successfully' });
    } catch (err) {
        console.error('Error deleting verification:', err);
        return res.status(500).json({ message: 'Failed to delete verification' });
    }
};

module.exports = {
    getAllVerifications,
    submitVerification,
    getVerificationById,
    getVerificationByUserId,
    updateVerificationStatus,
    updateVerification,
    deleteVerification
};