// truthify-backend/controllers/scancontroller.js
const Scan = require('../models/scan'); // Pulls in your real MongoDB schema

// 1. Save a new scan to the database
exports.saveScan = async (req, res) => {
    try {
        const scanData = req.body;
        
        // Ensure we know which user this scan belongs to
        if (!scanData.userId) {
            return res.status(400).json({ success: false, message: 'User ID is required to save a scan' });
        }

        // Save the AI results permanently to MongoDB
        const newScan = await Scan.create(scanData);

        res.status(201).json({ success: true, message: 'Scan saved to cloud successfully', scan: newScan });
    } catch (error) {
        console.error('Save Scan Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save scan to database' });
    }
};

// 2. Fetch user's scan history
exports.getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params; 
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Find all scans belonging to this specific user, sorted by newest first (-1)
        const history = await Scan.find({ userId: userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history from database' });
    }
};