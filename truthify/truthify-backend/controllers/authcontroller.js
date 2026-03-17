// truthify-backend/controllers/authcontroller.js
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ success: false, message: 'Name and PIN are required' });
    }

    const userExists = await User.findOne({ name: name.trim() });
    
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists. Please log in.' });
    }

    const user = await User.create({
      name: name.trim(),
      pin: pin.toString() 
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      preferences: user.preferences
    };

    return res.status(201).json({ success: true, message: 'Account created successfully', user: userResponse });
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

    const user = await User.findOne({ name: name.trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please sign up first.' });
    }

    const isMatch = await user.matchPin(pin);
    
    if (isMatch) {
      const userResponse = {
        _id: user._id,
        name: user.name,
        preferences: user.preferences
      };
      return res.status(200).json({ success: true, message: 'Login successful', user: userResponse });
    } else {
      return res.status(401).json({ success: false, message: 'Incorrect PIN. Try again.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};