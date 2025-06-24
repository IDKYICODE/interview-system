// backend/src/routes/interview.js
const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticateToken } = require('../utils/authUtils');

// Example endpoint to get interview details (requires candidate token authentication)
router.get('/:interviewId', authenticateToken, interviewController.getInterviewDetails);

module.exports = router;
