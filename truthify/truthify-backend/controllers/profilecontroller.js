// truthify-backend/controllers/profileController.js
const User = require('../models/User');

// 1. Fetch the user's current profile & preferences
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find the user but securely EXCLUDE the hashed PIN from the results using .select('-pin')
        const user = await User.findById(userId).select('-pin'); 
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, profile: user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

// 2. Update the user's profile (Name, Language, Preferences)
exports.updatePreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // We extract all three pieces of data sent from the Profile Screen
        const { name, language, preferences } = req.body; 

        // Update all fields in MongoDB simultaneously
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { name, language, preferences } },
            { new: true, runValidators: true } // 'new: true' returns the updated document
        ).select('-pin');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Profile updated successfully', profile: updatedUser });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};