const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

// Simple dashboard metrics
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const customersCount = await Customer.countDocuments({ user: userId });
    const leads = await Lead.find({ user: userId });
    const leadsCount = leads.length;
    const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0);
    const statusCounts = leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    res.json({ customersCount, leadsCount, totalValue, statusCounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;