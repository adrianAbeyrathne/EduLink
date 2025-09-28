const express = require('express');
const {
    create,
    deleteUser,
    getAllUsers,
    getUserById,
    update,
} = require("../controllers/ExternalUserController");

const router = express.Router();

// External CRUD routes - using different paths to avoid conflicts
router.post("/external-user", create);
router.get("/external-users", getAllUsers);
router.get("/external-user/:id", getUserById);
router.put("/update/external-user/:id", update);
router.delete("/delete/external-user/:id", deleteUser);

module.exports = router;