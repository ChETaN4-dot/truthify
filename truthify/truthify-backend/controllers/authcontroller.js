// truthify-backend/controllers/authcontroller.js
const User = require('../models/user');

exports.register = async (req, res) => {
  try {
    const { name, pin } = req.body;
    if (!name || !pin) {
      return res.status(400).json({ success: false, message: 'Name and PIN are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists — please pick a new name or just log in!' });
    }

    // Create the new user (the PIN will be hashed automatically by userSchema.pre('save'))
    const newUser = await User.create({ name, pin });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        _id: newUser._id,
        name: newUser.name,
        preferences: newUser.preferences,
      }
    });
  } catch (error) {
    console.error('Register API Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { name, pin } = req.body;
    if (!name || !pin) {
      return res.status(400).json({ success: false, message: 'Name and PIN are required' });
    }

    // Find the user by name
    const user = await User.findOne({ name: name.trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
    }

    // Compare provided PIN with hashed PIN in DB
    const isMatch = await user.matchPin(pin);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid PIN. Try again!' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        _id: user._id,
        name: user.name,
        preferences: user.preferences,
        language: user.language || 'English'
      }
    });
  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};