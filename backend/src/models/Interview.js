// backend/src/models/Interview.js
const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    score: { type: Number, required: true }, // Correctness score from 0-100
    feedback: { type: String, required: true } // Textual feedback
}, { _id: false }); // No _id for sub-documents

const evaluatedAnswerSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    evaluation: { type: evaluationSchema, required: true }
}, { _id: false }); // No _id for sub-documents

const interviewSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Using interviewId as _id
    candidateName: { type: String, required: true },
    topic: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['scheduled', 'in-progress', 'completed'], default: 'scheduled' },
    questionsAsked: [{ type: String }],
    candidateResponses: [{ type: String }],
    evaluatedAnswers: [evaluatedAnswerSchema], // NEW: Array to store evaluated answers
    endedAt: { type: Date }
}, { _id: false }); // Disable default _id generation, use custom _id

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;