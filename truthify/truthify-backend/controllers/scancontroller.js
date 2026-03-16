// truthify-backend/controllers/scancontroller.js - MOCKED FOR DEMO
exports.saveScan = async (req, res) => {
    try {
        console.log('--- Mock Saving Scan ---');
        res.status(201).json({ success: true, message: 'Scan saved (Mock)' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save scan' });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const history = [
            {
                _id: "scan_1",
                productName: "Coca Cola",
                overallScore: 22,
                createdAt: new Date().toISOString(),
                productCategory: "Drink",
                redFlagIngredients: [{ name: "High Fructose Corn Syrup" }]
            },
            {
                _id: "scan_2",
                productName: "Oats",
                overallScore: 88,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                productCategory: "Food",
                redFlagIngredients: []
            }
        ];
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};