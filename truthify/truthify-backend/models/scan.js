const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    // This links the scan to the specific user who made it
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    productName: { type: String, default: 'Unknown Product' },
    productCategory: { type: String, default: 'Food' },
    overallScore: { type: Number, default: 0 },
    scoreLabel: { type: String },
    redFlagIngredients: { type: Array, default: [] },
    warningIngredients: { type: Array, default: [] },
    safeIngredients: { type: Array, default: [] },
    summary: { type: String },
    imageUri: { type: String }
}, { 
    timestamps: true,
    strict: false // This allows us to save any extra AI data without crashing
});

module.exports = mongoose.model('Scan', scanSchema);