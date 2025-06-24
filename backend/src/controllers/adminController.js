// backend/src/controllers/adminController.js
const mongoService = require('../services/mongoService');
const AdminUser = require('../models/AdminUser'); // To potentially create admin users (for initial setup/user management)

// Get all interviews for the admin dashboard
exports.getAllInterviews = async (req, res) => {
    try {
        // Only allow if authenticated user is admin (checked by middleware)
        const interviews = await mongoService.getAllInterviewSessions();
        res.status(200).json({ interviews });
    } catch (error) {
        console.error('Error fetching all interviews for admin:', error);
        res.status(500).json({ message: 'Internal server error while fetching interviews.' });
    }
};

// Get a specific interview for admin (e.g., for detailed view)
exports.getInterviewById = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const interview = await mongoService.getInterviewSession(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found.' });
        }
        res.status(200).json({ interview });
    } catch (error) {
        console.error('Error fetching single interview for admin:', error);
        res.status(500).json({ message: 'Internal server error while fetching interview.' });
    }
};

// Example: Create an admin user (for initial setup)
// In a real app, this should be a protected route, perhaps only accessible by a "master admin"
exports.createAdminUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // In a real application, you would hash the password before saving
        const newAdmin = new AdminUser({ username, password }); // Consider bcrypt for password hashing
        await newAdmin.save();
        res.status(201).json({ message: 'Admin user created successfully.' });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(409).json({ message: 'Username already exists.' });
        }
        console.error('Error creating admin user:', error);
        res.status(500).json({ message: 'Internal server error while creating admin user.' });
    }
};
