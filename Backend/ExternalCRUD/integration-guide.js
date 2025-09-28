// External CRUD Routes Registration
// Add this to your main app.js file if you want to test the external CRUD system

const externalUserRouter = require('./ExternalCRUD/routes/ExternalUserRoutes');

// Register the external CRUD routes (add this line in your app.js routes section)
// app.use('/api', externalUserRouter);

// This will give you these endpoints:
// POST   /api/external-user                    - Create user
// GET    /api/external-users                   - Get all users  
// GET    /api/external-user/:id                - Get user by ID
// PUT    /api/update/external-user/:id         - Update user
// DELETE /api/delete/external-user/:id         - Delete user

module.exports = externalUserRouter;