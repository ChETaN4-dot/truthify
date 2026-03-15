const Scan = require('../models/scan');

// 1. Save a new scan from the app
exports.saveScan = async (req, res) => {
    try {
        const { userId, ...scanData } = req.body;
        
        const newScan = await Scan.create({ userId, ...scanData });
        res.status(201).json({ success: true, scan: newScan });
    } catch (error) {
        console.error('Error saving scan:', error);
        res.status(500).json({ success: false, message: 'Failed to save scan to database' });
    }
};

// 2. Send the history back to the HistoryScreen
exports.getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find all scans for this user, sorted by newest first
        const history = await Scan.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};