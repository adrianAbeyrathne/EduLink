const Role = require('../Model/Role');

// Get all roles
const getAllRoles = async (req, res) => {
    const ready = Role.db.readyState;
    if (ready !== 1) {
        return res.status(503).json({ message: 'Database not connected', readyState: ready });
    }

    try {
        const roles = await Role.find();
        return res.status(200).json({ roles });
    } catch (err) {
        console.error('Error fetching roles:', err);
        return res.status(500).json({ message: 'Failed to fetch roles' });
    }
};

// Create new role
const createRole = async (req, res) => {
    const { role_name, description } = req.body;

    try {
        const role = new Role({ role_name, description });
        await role.save();
        return res.status(201).json({ role });
    } catch (err) {
        console.error('Error creating role:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Role name already exists' });
        }
        return res.status(500).json({ message: 'Failed to create role' });
    }
};

// Get role by ID
const getRoleById = async (req, res) => {
    const { id } = req.params;

    try {
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        return res.status(200).json({ role });
    } catch (err) {
        console.error('Error fetching role:', err);
        return res.status(500).json({ message: 'Failed to fetch role' });
    }
};

// Update role
const updateRole = async (req, res) => {
    const { id } = req.params;
    const { role_name, description } = req.body;

    try {
        const role = await Role.findByIdAndUpdate(
            id, 
            { role_name, description }, 
            { new: true, runValidators: true }
        );
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        return res.status(200).json({ role });
    } catch (err) {
        console.error('Error updating role:', err);
        return res.status(500).json({ message: 'Failed to update role' });
    }
};

// Delete role
const deleteRole = async (req, res) => {
    const { id } = req.params;

    try {
        const role = await Role.findByIdAndDelete(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        return res.status(200).json({ message: 'Role deleted successfully', role });
    } catch (err) {
        console.error('Error deleting role:', err);
        return res.status(500).json({ message: 'Failed to delete role' });
    }
};

// Initialize default roles
const initializeDefaultRoles = async (req, res) => {
    try {
        const defaultRoles = [
            { role_name: 'Student', description: 'Student user with access to courses and study materials' },
            { role_name: 'Tutor', description: 'Tutor with ability to create and manage sessions' },
            { role_name: 'Admin', description: 'Administrator with full system access' },
            { role_name: 'Rep', description: 'Student representative with limited admin privileges' },
            { role_name: 'Moderator', description: 'Content moderator with community management rights' }
        ];

        const existingRoles = await Role.find();
        if (existingRoles.length > 0) {
            return res.status(400).json({ message: 'Roles already initialized' });
        }

        const roles = await Role.insertMany(defaultRoles);
        return res.status(201).json({ message: 'Default roles created successfully', roles });
    } catch (err) {
        console.error('Error initializing roles:', err);
        return res.status(500).json({ message: 'Failed to initialize roles' });
    }
};

module.exports = {
    getAllRoles,
    createRole,
    getRoleById,
    updateRole,
    deleteRole,
    initializeDefaultRoles
};