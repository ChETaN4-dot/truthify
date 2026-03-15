// truthify-backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pin: { type: String, required: true },
  loginMethod: { type: String, default: 'manual' },
  language: { type: String, default: 'English' }, // 👈 Added Language
  preferences: {
    // 👈 Added all 8 frontend toggles
    diabetic: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    lactoseFree: { type: Boolean, default: false },
    nutAllergy: { type: Boolean, default: false },
    noArtificialColors: { type: Boolean, default: false },
    noPreservatives: { type: Boolean, default: false },
    noPalmOil: { type: Boolean, default: false }
  }
}, { timestamps: true });

// 🔒 Hash the PIN before saving
userSchema.pre('save', async function() {
  if (!this.isModified('pin')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
  } catch (error) {
    throw new Error('Error hashing PIN: ' + error.message);
  }
});

// 🔓 Compare hashed PIN
userSchema.methods.matchPin = async function(enteredPin) {
  return await bcrypt.compare(enteredPin.toString(), this.pin);
};

module.exports = mongoose.model('User', userSchema);