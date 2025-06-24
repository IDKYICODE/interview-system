// backend/src/app.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app); // Create HTTP server for Express and WebSocket
const wss = new WebSocket.Server({ server }); // Create WebSocket server instance

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Import routes
const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
const adminRoutes = require('./routes/admin'); // New: Admin routes
const interviewSocketHandler = require('./websockets/interviewSocket');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/admin', adminRoutes); // New: Register admin routes

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    console.log('Client connected to WebSocket.');
    interviewSocketHandler(ws, req); // Pass ws and req, mongoService will be imported internally
});

// Basic health check endpoint
app.get('/', (req, res) => {
    res.send('Interview System Backend is running!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export app for potential testing
