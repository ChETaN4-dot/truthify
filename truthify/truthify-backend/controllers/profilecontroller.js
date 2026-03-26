const User = require('../models/user');

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, profile: user });
    } catch (error) {
        console.error('Profile Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, language, preferences } = req.body;
        
        // Find user and update their details
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, language, preferences },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully!', 
            profile: updatedUser 
        });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};