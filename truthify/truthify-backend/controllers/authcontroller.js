// truthify-backend/controllers/authController.js - MOCKED FOR DEMO
// This version bypasses MongoDB to allow the frontend demo to work

exports.register = async (req, res) => {
  try {
    const { name, pin } = req.body;
    if (!name || !pin) {
      return res.status(400).json({ success: false, message: 'Name and PIN are required' });
    }

    console.log('--- Mock Register Triggered ---');
    const userResponse = {
      _id: "mock_user_" + Date.now(),
      name: name.trim(),
      preferences: {}
    };

    return res.status(201).json({ success: true, message: 'Account created successfully (Mock)', user: userResponse });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { name, pin } = req.body;
    if (!name || !pin) {
      return res.status(400).json({ success: false, message: 'Name and PIN are required' });
    }

    console.log('--- Mock Login Triggered ---');
    const userResponse = {
      _id: "mock_user_123",
      name: name.trim(),
      preferences: {}
    };

    return res.status(200).json({ success: true, message: 'Login successful (Mock)', user: userResponse });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};