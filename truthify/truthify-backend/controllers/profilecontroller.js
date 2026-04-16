<<<<<<< HEAD
// truthify-backend/controllers/profilecontroller.js
const User = require('../models/User');
=======
const User = require('../models/user');
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
<<<<<<< HEAD
        const user = await User.findById(userId).select('-pin'); 
        
=======
        const user = await User.findById(userId);
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, profile: user });
    } catch (error) {
<<<<<<< HEAD
        console.error('Get Profile Error:', error);
=======
        console.error('Profile Fetch Error:', error);
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { userId } = req.params;
<<<<<<< HEAD
        const { name, language, preferences } = req.body; 

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { name, language, preferences } },
            { new: true, runValidators: true }
        ).select('-pin');
=======
        const { name, language, preferences } = req.body;
        
        // Find user and update their details
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, language, preferences },
            { new: true, runValidators: true } // Return the updated document
        );
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

<<<<<<< HEAD
        res.status(200).json({ success: true, message: 'Profile updated successfully', profile: updatedUser });
    } catch (error) {
        console.error('Update Profile Error:', error);
=======
        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully!', 
            profile: updatedUser 
        });
    } catch (error) {
        console.error('Profile Update Error:', error);
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};