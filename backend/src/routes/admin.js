// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../utils/authUtils');

// Protect all admin routes with authentication and role check
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Get all interviews for admin dashboard
router.get('/interviews', adminController.getAllInterviews);

// Example: Get a specific interview by ID for admin
router.get('/interviews/:interviewId', adminController.getInterviewById);

// Example: Create an admin user (for initial setup, or if you build a user management system)
router.post('/users', adminController.createAdminUser); // Should be protected by a master admin if used in prod.

module.exports = router;
