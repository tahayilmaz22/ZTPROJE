const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/logs - List operation logs
router.get('/', async (req, res, next) => {
  try {
    const { entity_type, limit, offset } = req.query;

    let query = 'SELECT * FROM operation_logs WHERE 1=1';
    const params = [];

    if (entity_type) {
      params.push(entity_type);
      query += ' AND entity_type = ?';
    }

    query += ' ORDER BY changed_at DESC';

    const count = Math.min(parseInt(limit) || 100, 500);
    params.push(count);
    query += ' LIMIT ?';

    if (offset) {
      params.push(parseInt(offset));
      query += ' OFFSET ?';
    }

    const [logs] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) AS total FROM operation_logs';
    const countParams = [];
    if (entity_type) {
      countQuery += ' WHERE entity_type = ?';
      countParams.push(entity_type);
    }
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      logs,
      total: parseInt(countResult[0].total),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
