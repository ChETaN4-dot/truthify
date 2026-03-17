// truthify-backend/controllers/profilecontroller.js
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
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

exports.updatePreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, language, preferences } = req.body; 

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { name, language, preferences } },
            { new: true, runValidators: true }
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