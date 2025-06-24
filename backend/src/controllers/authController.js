// backend/src/controllers/authController.js
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const mongoService = require('../services/mongoService'); // Import the new Mongo service
const AdminUser = require('../models/AdminUser'); // Import AdminUser model

// Function to generate unique interview link and credentials
exports.generateInterviewLink = async (req, res) => {
    try {
        const { candidateName, interviewTopic, interviewDate, interviewTime } = req.body;

        if (!candidateName || !interviewTopic || !interviewDate || !interviewTime) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const interviewId = uuidv4();
        const password = Math.random().toString(36).substring(2, 8);

        await mongoService.createInterviewSession(
            interviewId,
            candidateName,
            interviewTopic,
            interviewDate,
            interviewTime,
            password
        );

        const interviewLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/interview/${interviewId}`;

        res.status(200).json({
            message: 'Interview link generated successfully.',
            interviewId,
            password,
            interviewLink
        });

    } catch (error) {
        console.error('Error generating interview link:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Function for interview candidate login
exports.loginCandidateUser = async (req, res) => {
    try {
        const { interviewId, password } = req.body;

        if (!interviewId || !password) {
            return res.status(400).json({ message: 'Interview ID and password are required.' });
        }

        const interviewData = await mongoService.getInterviewSession(interviewId);

        if (!interviewData) {
            return res.status(404).json({ message: 'Interview session not found.' });
        }

        if (interviewData.password !== password) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // Generate JWT token for the candidate with 'candidate' role
        const token = jwt.sign(
            { interviewId: interviewData._id, candidateName: interviewData.candidateName, role: 'candidate' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: interviewData._id,
                name: interviewData.candidateName,
                role: 'candidate',
                topic: interviewData.topic
            }
        });

    } catch (error) {
        console.error('Error during interview candidate login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// New: Function for admin login
exports.loginAdminUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // In a real application, you would hash the password and compare hashes.
        // For demonstration, we'll use simple plain text check against .env or a seeded admin user.
        // First, check against hardcoded env variables for initial setup
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { id: 'admin_static', username: username, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '8h' } // Admin token expires in 8 hours
            );
            return res.status(200).json({
                message: 'Admin login successful!',
                token,
                user: { id: 'admin_static', name: username, role: 'admin' }
            });
        }

        // Optional: Check against AdminUser collection if you create one
        // const adminUser = await AdminUser.findOne({ username });
        // if (!adminUser || adminUser.password !== password) { // Replace with bcrypt.compare for hashed passwords
        //     return res.status(401).json({ message: 'Invalid admin credentials.' });
        // }
        // const token = jwt.sign(
        //     { id: adminUser._id, username: adminUser.username, role: 'admin' },
        //     process.env.JWT_SECRET,
        //     { expiresIn: '8h' }
        // );
        // res.status(200).json({
        //     message: 'Admin login successful!',
        //     token,
        //     user: { id: adminUser._id, name: adminUser.username, role: 'admin' }
        // });

        return res.status(401).json({ message: 'Invalid admin credentials.' });

    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};