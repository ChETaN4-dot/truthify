// truthify-backend/controllers/fssaicontroller.js
const FssaiRule = require('../models/FssaiRule');

// 1. Get all trusted rules for the app to use
exports.getAllRules = async (req, res) => {
    try {
        const rules = await FssaiRule.find({});
        
        // Convert the array of rules into a dictionary/object so the frontend can check it instantly
        const rulesDictionary = {};
        rules.forEach(rule => {
            rulesDictionary[rule.keyName] = rule;
        });

        res.status(200).json({ success: true, data: rulesDictionary });
    } catch (error) {
        console.error('Fetch Rules Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch FSSAI rules' });
    }
};

// 2. Admin Route: Add a newly discovered chemical to the cloud
exports.addRule = async (req, res) => {
    try {
        const newRule = await FssaiRule.create(req.body);
        res.status(201).json({ success: true, message: 'New FSSAI rule added to cloud!', data: newRule });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'This chemical is already in the database.' });
        }
        res.status(500).json({ success: false, message: 'Failed to add rule' });
    }
};