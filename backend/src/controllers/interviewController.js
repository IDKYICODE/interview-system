// backend/src/controllers/interviewController.js
const mongoService = require('../services/mongoService'); // Import the new Mongo service

exports.getInterviewDetails = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const userId = req.user.interviewId; // Assuming interviewId is used as userId in token payload

        // Ensure the authenticated user has access to this interview (and that it's a candidate)
        if (req.user.role !== 'candidate' || userId !== interviewId) {
            return res.status(403).json({ message: 'Access denied to this interview session.' });
        }

        const interviewData = await mongoService.getInterviewSession(interviewId);

        if (!interviewData) {
            return res.status(404).json({ message: 'Interview session not found.' });
        }

        res.status(200).json({ interview: interviewData });

    } catch (error) {
        console.error('Error fetching interview details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
