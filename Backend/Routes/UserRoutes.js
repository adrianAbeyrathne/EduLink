const express = require('express');
const router = express.Router();
const User = require("../Model/UserModel");
const UserController = require("../Controllers/UserController");

router.get("/",UserController.getAllUsers);
router.post("/",UserController.addUsers);
router.get("/:id",UserController.getById);
router.put("/:id",UserController.updateUser);
router.delete("/:id",UserController.deleteUser);
// Optional flexible delete: allows DELETE /users?id=... or id in body
router.delete("/", UserController.deleteUserFlexible);




module.exports = router;
