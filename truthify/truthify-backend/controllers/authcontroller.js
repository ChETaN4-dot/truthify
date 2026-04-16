// truthify-backend/controllers/authcontroller.js
<<<<<<< HEAD
const User = require('../models/User');
=======
const User = require('../models/user');
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c

exports.register = async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ success: false, message: 'Name and PIN are required' });
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c
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

<<<<<<< HEAD
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
=======
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
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c
  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};