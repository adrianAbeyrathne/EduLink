const express = require('express');
const router = express.Router();
const User = require("../Model/UserModel");
const UserController = require("../Controllers/UserController");

router.get("/",UserController.getAllUsers);
router.get("/search", UserController.searchUsers); // Add search route before /:id route
router.get("/test-route", (req, res) => {
    res.json({ message: "UserRoutes is working!", timestamp: new Date().toISOString() });
});
router.post("/",UserController.addUsers);
router.get("/:id",UserController.getById);
// router.get("/:id/activity",UserController.getUserActivity); // Temporarily commented out
router.put("/:id",UserController.updateUser);
router.delete("/:id",UserController.deleteUser);
// Optional flexible delete: allows DELETE /users?id=... or id in body
router.delete("/", UserController.deleteUserFlexible);




// Multer setup for profile picture upload
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../uploads'));
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});
const upload = multer({ storage });

// Profile picture upload route
router.post('/:id/profile-pic', upload.single('profilePic'), UserController.uploadProfilePic);

// Profile picture delete route
router.delete('/:id/profile-pic', UserController.deleteProfilePic);

module.exports = router;
