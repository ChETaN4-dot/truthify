// truthify-backend/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile, updatePreferences } = require('../controllers/profilecontroller');

// GET /api/profile/:userId -> Fetch profile data
router.get('/:userId', getProfile);

// PUT /api/profile/:userId/preferences -> Update preferences
router.put('/:userId/preferences', updatePreferences);

module.exports = router;