// truthify-backend/controllers/authController.js
const User = require('../models/User');

// ==========================================
// 1. REGISTER (Sign Up)
// ==========================================
exports.register = async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ success: false, message: 'Name and PIN are required' });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ name: name.trim() });
    
    if (userExists) {
      // If user exists, block registration
      return res.status(400).json({ success: false, message: 'User already exists. Please log in.' });
    }

    // Create the new user. The pre-save hook in User.js will automatically hash the PIN!
    const user = await User.create({
      name: name.trim(),
      pin: pin.toString() // Convert to string to prevent bcrypt errors if a number is sent
    });

    // Security: Don't send the hashed PIN back to the frontend!
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

// ==========================================
// 2. LOGIN
// ==========================================
exports.login = async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ success: false, message: 'Name and PIN are required' });
    }

    // Find the user in the database
    const user = await User.findOne({ name: name.trim() });

    // If user DOES NOT exist
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please sign up first.' });
    }

    // If user DOES exist, verify the PIN using our custom Bcrypt method
    const isMatch = await user.matchPin(pin);
    
    if (isMatch) {
      // Security: Don't send the hashed PIN back to the frontend!
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