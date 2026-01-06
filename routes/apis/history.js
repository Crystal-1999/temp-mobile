const express = require('express');
const router = express.Router();
const History = require('../../models/historyModel');

// GET user's history
router.get('/', async (req, res) => {
    try {
        if (!req.customer?.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }        

        const history = await History.find({ 
            customer_id: req.customer.id 
        }).sort({ createdAt: -1 }).limit(50);

        console.log(`Found ${history.length} history items for customer ${req.customer.id}`);
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history', details: error.message });
    }
});

// DELETE user's history
router.delete('/', async (req, res) => {
    try {
        if (!req.customer?.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const result = await History.deleteMany({ customer_id: req.customer.id });
        console.log(`Deleted ${result.deletedCount} history items for customer ${req.customer.id}`);
        res.json({ message: 'History cleared', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: 'Failed to clear history', details: error.message });
    }
});

module.exports = router;