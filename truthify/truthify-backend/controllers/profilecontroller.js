// truthify-backend/controllers/profileController.js - MOCKED FOR DEMO
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const mockUser = {
            _id: userId,
            name: "Truthify User",
            language: "English",
            preferences: { vegan: false, diabetic: false },
            createdAt: new Date().toISOString()
        };
        res.status(200).json({ success: true, profile: mockUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, language, preferences } = req.body;
        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully (Mock)', 
            profile: { _id: userId, name, language, preferences } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};