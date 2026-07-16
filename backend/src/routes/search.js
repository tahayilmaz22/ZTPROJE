const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/search?q=term - Global search across customers and terminals
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.json({ customers: [], terminals: [] });
    }

    const searchTerm = `%${q.trim()}%`;

    // Search customers by customer_no, first_name, last_name
    const [customers] = await pool.query(
      `SELECT id, customer_no, customer_type, first_name, last_name, phone, email
       FROM customers
       WHERE customer_no LIKE ?
          OR first_name LIKE ?
          OR last_name LIKE ?
          OR phone LIKE ?
       ORDER BY id DESC
       LIMIT 20`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    // Search terminals by terminal_id, serial_no
    const [terminals] = await pool.query(
      `SELECT t.id, t.terminal_id, t.serial_no, t.model_code, t.registration_status,
              t.workplace_id,
              w.name AS workplace_name, w.workplace_no,
              c.customer_no, c.first_name, c.last_name
       FROM terminals t
       JOIN workplaces w ON t.workplace_id = w.id
       JOIN customers c ON w.customer_id = c.id
       WHERE t.terminal_id LIKE ?
          OR t.serial_no LIKE ?
          OR t.model_code LIKE ?
       ORDER BY t.id DESC
       LIMIT 20`,
      [searchTerm, searchTerm, searchTerm]
    );

    // Search workplaces by name, workplace_no
    const [workplaces] = await pool.query(
      `SELECT w.id, w.workplace_no, w.name, w.manager, w.status, w.workplace_type,
              w.customer_id, c.customer_no, c.first_name, c.last_name
       FROM workplaces w
       JOIN customers c ON w.customer_id = c.id
       WHERE w.name LIKE ?
          OR w.workplace_no LIKE ?
       ORDER BY w.id DESC
       LIMIT 10`,
      [searchTerm, searchTerm]
    );

    res.json({
      customers,
      terminals,
      workplaces,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
