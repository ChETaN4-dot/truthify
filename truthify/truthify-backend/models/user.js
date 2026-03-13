// truthify-backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  pin: { 
    type: String, 
    required: true 
  },
  loginMethod: { 
    type: String, 
    default: 'manual' 
  },
  preferences: {
    glutenFree: { type: Boolean, default: false },
    palmOilFree: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    diabetic: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);