// backend/src/models/AdminUser.js
const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true } // In production, hash this password!
});

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

module.exports = AdminUser;