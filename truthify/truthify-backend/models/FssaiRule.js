// truthify-backend/models/FssaiRule.js
const mongoose = require('mongoose');

const fssaiRuleSchema = new mongoose.Schema({
    keyName: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true, // e.g., "ins 476" or "maltodextrin"
    },
    technicalName: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String 
    },
    severity: { 
        type: String, 
        enum: ['HIGH', 'MEDIUM', 'LOW', 'SAFE'],
        required: true 
    },
    healthEffect: { 
        type: String 
    },
    fssaiLimit: { 
        type: String 
    },
    source: { 
        type: String,
        default: 'FSSAI Regulations'
    }
}, { timestamps: true });

module.exports = mongoose.model('FssaiRule', fssaiRuleSchema);