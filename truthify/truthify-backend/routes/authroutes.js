// truthify-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Import the two new functions from the controller
const { register, login } = require('../controllers/authcontroller');

// Define the two separate endpoints
router.post('/register', register);  // http://localhost:5000/api/auth/register
router.post('/login', login);        // http://localhost:5000/api/auth/login

module.exports = router;