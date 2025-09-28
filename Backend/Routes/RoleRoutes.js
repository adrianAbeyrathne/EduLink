const express = require('express');
const router = express.Router();
const RoleController = require('../Controllers/RoleController');

// GET /roles - Get all roles
router.get('/', RoleController.getAllRoles);

// POST /roles - Create a new role
router.post('/', RoleController.createRole);

// GET /roles/initialize - Initialize default roles
router.get('/initialize', RoleController.initializeDefaultRoles);

// GET /roles/:id - Get role by ID
router.get('/:id', RoleController.getRoleById);

// PUT /roles/:id - Update role
router.put('/:id', RoleController.updateRole);

// DELETE /roles/:id - Delete role
router.delete('/:id', RoleController.deleteRole);

module.exports = router;