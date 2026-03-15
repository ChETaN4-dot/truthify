const express = require('express');
const router = express.Router();
const { saveScan, getUserHistory } = require('../controllers/scancontroller');

// POST /api/scans/save
router.post('/save', saveScan);

// GET /api/scans/history/:userId
router.get('/history/:userId', getUserHistory);

module.exports = router;