// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint to generate an interview link and credentials (for admin/Teams)
router.post('/generate-link', authController.generateInterviewLink);

// Endpoint for interview candidate login
router.post('/login/candidate', authController.loginCandidateUser); // Renamed for clarity
router.post('/login/admin', authController.loginAdminUser); // New: Admin login

module.exports = router;