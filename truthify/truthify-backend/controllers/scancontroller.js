<<<<<<< HEAD
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
=======
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
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c
    }
};

// 2. Fetch user's scan history
exports.getUserHistory = async (req, res) => {
    try {
<<<<<<< HEAD
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
// 3. Delete a scan from history
exports.deleteScan = async (req, res) => {
    try {
        const { scanId } = req.params;
        
        const deletedScan = await Scan.findByIdAndDelete(scanId);
        
        if (!deletedScan) {
            return res.status(404).json({ success: false, message: 'Scan not found' });
        }

        res.status(200).json({ success: true, message: 'Scan deleted successfully' });
    } catch (error) {
        console.error('Delete Scan Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete scan from database' });
=======
        const { userId } = req.params;
        // Fetch all scans for this user, sorted by most recent first
        const history = await Scan.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('History Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch scan history' });
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c
    }
};