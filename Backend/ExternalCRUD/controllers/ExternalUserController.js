const ExternalUser = require("../models/ExternalUserModel");

const create = async (req, res) => {
    try {
        console.log('Creating new user with data:', req.body);
        const newUser = new ExternalUser(req.body);
        const { email, studentId } = newUser;

        // Check if user already exists by email
        const emailExists = await ExternalUser.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "Student with this email already exists." });
        }

        // Check if student ID already exists
        const studentIdExists = await ExternalUser.findOne({ studentId });
        if (studentIdExists) {
            return res.status(400).json({ message: "Student ID already exists." });
        }

        const savedData = await newUser.save();
        console.log('User created successfully:', savedData);
        res.status(201).json({ message: "Student created successfully.", user: savedData });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: validationErrors.join(', ') });
        }
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        console.log('Fetching all users...');
        const userData = await ExternalUser.find().sort({ createdAt: -1 });
        console.log(`Found ${userData.length} users`);
        
        if (!userData || userData.length === 0) {
            return res.status(200).json([]); // Return empty array instead of error
        }
        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Fetching user by ID:', id);
        
        const userExist = await ExternalUser.findById(id);
        if (!userExist) {
            return res.status(404).json({ message: "Student not found." });
        }
        
        console.log('User found:', userExist);
        res.status(200).json(userExist);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Updating user with ID:', id);
        console.log('Update data:', req.body);
        
        const userExist = await ExternalUser.findById(id);
        if (!userExist) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Check for duplicate email (excluding current user)
        if (req.body.email && req.body.email !== userExist.email) {
            const emailExists = await ExternalUser.findOne({ 
                email: req.body.email, 
                _id: { $ne: id } 
            });
            if (emailExists) {
                return res.status(400).json({ message: "Email already exists." });
            }
        }

        // Check for duplicate student ID (excluding current user)
        if (req.body.studentId && req.body.studentId !== userExist.studentId) {
            const studentIdExists = await ExternalUser.findOne({ 
                studentId: req.body.studentId, 
                _id: { $ne: id } 
            });
            if (studentIdExists) {
                return res.status(400).json({ message: "Student ID already exists." });
            }
        }

        const updatedData = await ExternalUser.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        
        console.log('User updated successfully:', updatedData);
        res.status(200).json({ 
            message: "Student updated successfully.", 
            user: updatedData 
        });
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: validationErrors.join(', ') });
        }
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Deleting user with ID:', id);
        
        const userExist = await ExternalUser.findById(id);
        if (!userExist) {
            return res.status(404).json({ message: "Student not found." });
        }
        
        await ExternalUser.findByIdAndDelete(id);
        console.log('User deleted successfully');
        res.status(200).json({ message: "Student deleted successfully." });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    create,
    getAllUsers,
    getUserById,
    update,
    deleteUser
};