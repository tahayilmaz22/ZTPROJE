const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { validateWorkplace } = require('../utils/validators');
const { createError } = require('../middleware/errorHandler');

// GET /api/customers/:customerId/workplaces - List workplaces for a customer
router.get('/customers/:customerId/workplaces', async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM workplaces WHERE customer_id = ? ORDER BY id DESC',
      [customerId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/workplaces - List all workplaces
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.*, c.customer_no, c.first_name, c.last_name
       FROM workplaces w
       JOIN customers c ON w.customer_id = c.id
       ORDER BY w.id DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/workplaces/:id - Get single workplace
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT w.*, c.customer_no, c.first_name, c.last_name
       FROM workplaces w
       JOIN customers c ON w.customer_id = c.id
       WHERE w.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw createError(404, 'İşyeri bulunamadı.');
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers/:customerId/workplaces - Create workplace
router.post('/customers/:customerId/workplaces', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { customerId } = req.params;

    const [custCheck] = await conn.query('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (custCheck.length === 0) {
      throw createError(404, 'Müşteri bulunamadı.');
    }

    const errors = validateWorkplace(req.body);
    if (errors.length > 0) {
      throw createError(400, errors.join(' '));
    }

    const [noResult] = await conn.query(
      "SELECT CONCAT('I-', LPAD(COALESCE(MAX(CAST(SUBSTRING(workplace_no, 3) AS UNSIGNED)), 0) + 1, 6, '0')) AS new_no FROM workplaces"
    );
    const workplace_no = noResult[0].new_no;

    const {
      name, status, partners, manager,
      address_line1, address_line2, city, district, postal_code,
      tax_tc_no, workplace_type, commission_rate, block_day,
    } = req.body;

    const [result] = await conn.query(
      `INSERT INTO workplaces (workplace_no, customer_id, name, status, partners, manager,
        address_line1, address_line2, city, district, postal_code,
        tax_tc_no, workplace_type, commission_rate, block_day)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [workplace_no, customerId, name, status || 'active', partners, manager,
       address_line1, address_line2, city, district, postal_code,
       tax_tc_no, workplace_type || 'normal', commission_rate || 0, block_day || 0]
    );

    const workplaceId = result.insertId;

    // Log creation
    await conn.query(
      `INSERT INTO operation_logs (entity_type, entity_id, action, new_value, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      ['workplace', workplaceId, 'create', `İşyeri oluşturuldu: ${name}`, 'system']
    );

    // Fetch the inserted row
    const [rows] = await conn.query('SELECT * FROM workplaces WHERE id = ?', [workplaceId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
});

// PUT /api/workplaces/:id - Update workplace (with status change logging)
router.put('/:id', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const [existing] = await conn.query('SELECT * FROM workplaces WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw createError(404, 'İşyeri bulunamadı.');
    }

    const errors = validateWorkplace(req.body);
    if (errors.length > 0) {
      throw createError(400, errors.join(' '));
    }

    const oldWorkplace = existing[0];

    const {
      name, status, partners, manager,
      address_line1, address_line2, city, district, postal_code,
      tax_tc_no, workplace_type, commission_rate, block_day,
    } = req.body;

    await conn.query(
      `UPDATE workplaces SET
        name = ?, status = ?, partners = ?, manager = ?,
        address_line1 = ?, address_line2 = ?, city = ?, district = ?, postal_code = ?,
        tax_tc_no = ?, workplace_type = ?, commission_rate = ?, block_day = ?
       WHERE id = ?`,
      [name, status, partners, manager,
       address_line1, address_line2, city, district, postal_code,
       tax_tc_no, workplace_type, commission_rate || 0, block_day || 0, id]
    );

    // Log status change if status changed
    if (oldWorkplace.status !== status) {
      await conn.query(
        `INSERT INTO operation_logs (entity_type, entity_id, action, old_value, new_value, changed_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['workplace', id, 'status_change', oldWorkplace.status, status, 'system']
      );
    }

    // Fetch updated row
    const [rows] = await conn.query('SELECT * FROM workplaces WHERE id = ?', [id]);

    res.json(rows[0]);
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
});

// DELETE /api/workplaces/:id - Delete workplace
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // SELECT before DELETE (MySQL doesn't support RETURNING)
    const [rows] = await pool.query('SELECT * FROM workplaces WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw createError(404, 'İşyeri bulunamadı.');
    }

    await pool.query('DELETE FROM workplaces WHERE id = ?', [id]);

    res.json({ message: 'İşyeri başarıyla silindi.', workplace: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
