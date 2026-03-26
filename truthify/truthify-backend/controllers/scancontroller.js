const Scan = require('../models/scan');

exports.saveScan = async (req, res) => {
    try {
        const { userId, ...scanData } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Create a new scan linked to this user
        const newScan = await Scan.create({
            userId,
            ...scanData
        });

        res.status(201).json({ success: true, message: 'Scan saved to your history!', scan: newScan });
    } catch (error) {
        console.error('Save Scan Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save scan to cloud' });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        // Fetch all scans for this user, sorted by most recent first
        const history = await Scan.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('History Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch scan history' });
    }
};