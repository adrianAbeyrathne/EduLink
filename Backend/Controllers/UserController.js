const User = require('../Model/UserModel');

const getAllUsers = async (req, res, next) => {
    // If DB is not connected, return 503 Service Unavailable
    const ready = User.db.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    if (ready !== 1) {
        return res.status(503).json({ message: 'Database not connected', readyState: ready });
    }

    try {
        const users = await User.find();
        // Return empty array with 200 instead of 404 when no users
        return res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch users' });
    }
};

const addUsers = async (req, res, next) => {
    const { name, email, age, address } = req.body;

    let users;  

    try {
        users = new User({ name, email, age, address });
        await users.save();
    } catch (err) {
        console.log(err);
    }

    if (!users) {
        return res.status(404).json({ message: "Unable to add users" });
    }
    return res.status(200).json({ users });
};

const getById = async (req, res, next) => {
    const id = req.params.id;

    let user;

    try {
        user = await User.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
};

const updateUser = async (req, res, next) => {
        const id = req.params.id;
        const { name, email, age, address } = req.body;
        let users;
        try {
            users = await User.findByIdAndUpdate(id, { name, email, age, address });
            users = await users.save();
        } catch (err) {
            console.log(err);
        }
        if (!users) {
        return res.status(404).json({ message: "Unable to update user details" });
    }
    return res.status(200).json({ users });


}

const deleteUser = async (req, res, next) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: 'User id is required' });
    }

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Invalid user id' });
    }
}

// Flexible delete: allow DELETE /users?id=... or id in JSON body
const deleteUserFlexible = async (req, res, next) => {
    const id = req.query.id || req.body?.id;
    if (!id) {
        return res.status(400).json({ message: 'User id is required (use /users/:id or provide id in query/body)' });
    }
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Invalid user id' });
    }
}

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;    
exports.deleteUserFlexible = deleteUserFlexible;