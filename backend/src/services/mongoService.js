// backend/src/services/mongoService.js
const Interview = require('../models/Interview'); // Import the Mongoose Interview model
const AdminUser = require('../models/AdminUser'); // Import the new AdminUser model

/**
 * Creates a new interview session document in MongoDB.
 * @param {string} interviewId - Unique ID for the interview.
 * @param {string} candidateName - Name of the candidate.
 * @param {string} interviewTopic - Topic of the interview.
 * @param {string} interviewDate - Date of the interview.
 * @param {string} interviewTime - Time of the interview.
 * @param {string} password - Password for the candidate to access.
 */
exports.createInterviewSession = async (interviewId, candidateName, interviewTopic, interviewDate, interviewTime, password) => {
    try {
        const newInterview = new Interview({
            _id: interviewId, // Use the provided interviewId as the document's _id
            candidateName,
            topic: interviewTopic,
            date: interviewDate,
            time: interviewTime,
            password,
            status: 'scheduled',
            questionsAsked: [],
            candidateResponses: [],
            evaluatedAnswers: [] // NEW: Initialize evaluatedAnswers array
        });
        await newInterview.save();
        console.log(`Interview session ${interviewId} created in MongoDB.`);
    } catch (error) {
        console.error('Error creating interview session in MongoDB:', error);
        throw new Error('Failed to create interview session.');
    }
};

/**
 * Updates an existing interview session document in MongoDB.
 * @param {string} interviewId - Unique ID of the interview.
 * @param {object} data - Data to update.
 */
exports.updateInterviewSession = async (interviewId, data) => {
    try {
        // Use $set to update specific fields, or directly pass data if replacing entire doc
        await Interview.findByIdAndUpdate(interviewId, { $set: data }, { new: true });
        console.log(`Interview session ${interviewId} updated in MongoDB.`);
    } catch (error) {
        console.error('Error updating interview session in MongoDB:', error);
        throw new Error('Failed to update interview session.');
    }
};

/**
 * Fetches an interview session by ID from MongoDB.
 * @param {string} interviewId - Unique ID of the interview.
 * @returns {Promise<object|null>} Interview data or null if not found.
 */
exports.getInterviewSession = async (interviewId) => {
    try {
        const interview = await Interview.findById(interviewId).lean(); // .lean() to get a plain JS object
        return interview;
    } catch (error) {
        console.error('Error fetching interview session from MongoDB:', error);
        throw new Error('Failed to fetch interview session.');
    }
};

/**
 * Fetches all interview sessions from MongoDB.
 * @returns {Promise<object[]>} An array of all interview session data.
 */
exports.getAllInterviewSessions = async () => {
    try {
        const interviews = await Interview.find({}).lean();
        return interviews;
    } catch (error) {
        console.error('Error fetching all interview sessions from MongoDB:', error);
        throw new Error('Failed to fetch all interview sessions.');
    }
};

// You could add admin user related DB functions here if they use AdminUser model
// exports.createAdminUser = async (username, password) => { ... }
// exports.findAdminUser = async (username) => { ... }