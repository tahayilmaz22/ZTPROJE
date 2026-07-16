const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/dashboard/stats - Dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Total open terminal count
    const [openTerminalsResult] = await pool.query(
      'SELECT COUNT(*) AS count FROM terminals WHERE registration_status = 1'
    );

    // Total blocked amount across all accounts
    const [blockedAmountResult] = await pool.query(
      'SELECT COALESCE(SUM(blocked_amount), 0) AS total FROM accounts'
    );

    // Customers added today
    const [todayCustomersResult] = await pool.query(
      'SELECT COUNT(*) AS count FROM customers WHERE DATE(registration_date) = CURDATE()'
    );

    // Total customer count
    const [totalCustomersResult] = await pool.query(
      'SELECT COUNT(*) AS count FROM customers'
    );

    // Total terminal count
    const [totalTerminalsResult] = await pool.query(
      'SELECT COUNT(*) AS count FROM terminals'
    );

    // Total workplace count
    const [totalWorkplacesResult] = await pool.query(
      'SELECT COUNT(*) AS count FROM workplaces'
    );

    res.json({
      openTerminals: parseInt(openTerminalsResult[0].count),
      totalBlockedAmount: parseFloat(blockedAmountResult[0].total),
      todayCustomers: parseInt(todayCustomersResult[0].count),
      totalCustomers: parseInt(totalCustomersResult[0].count),
      totalTerminals: parseInt(totalTerminalsResult[0].count),
      totalWorkplaces: parseInt(totalWorkplacesResult[0].count),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
