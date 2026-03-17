// truthify-backend/routes/fssairoutes.js
const express = require('express');
const router = express.Router();
const { getAllRules, addRule } = require('../controllers/fssaicontroller');

// Route 1: Get all FSSAI rules (The App will call this when it opens)
router.get('/', getAllRules);

// Route 2: Add a new FSSAI rule (You can call this from Postman or an Admin panel)
router.post('/add', addRule);

module.exports = router;