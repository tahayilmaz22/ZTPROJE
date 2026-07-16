const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { validateAccount } = require('../utils/validators');
const { createError } = require('../middleware/errorHandler');

// GET /api/customers/:customerId/accounts - List accounts for a customer
router.get('/customers/:customerId/accounts', async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM accounts WHERE customer_id = ? AND deleted_at IS NULL ORDER BY id DESC',
      [customerId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/accounts - List all accounts
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.customer_no, c.first_name, c.last_name
       FROM accounts a
       JOIN customers c ON a.customer_id = c.id
       WHERE a.deleted_at IS NULL AND c.deleted_at IS NULL
       ORDER BY a.id DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/accounts/:id - Get single account
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ? AND deleted_at IS NULL', [id]);

    if (rows.length === 0) {
      throw createError(404, 'Hesap bulunamadı.');
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers/:customerId/accounts - Create account
router.post('/customers/:customerId/accounts', async (req, res, next) => {
  try {
    const { customerId } = req.params;

    // Check customer exists and not deleted
    const [custCheck] = await pool.query('SELECT id FROM customers WHERE id = ? AND deleted_at IS NULL', [customerId]);
    if (custCheck.length === 0) {
      throw createError(404, 'Müşteri bulunamadı.');
    }

    const errors = validateAccount(req.body);
    if (errors.length > 0) {
      throw createError(400, errors.join(' '));
    }

    const {
      extension_no, status, account_name, currency_code,
      balance, blocked_amount, interest_rate, iban,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO accounts (customer_id, extension_no, status, account_name, currency_code, balance, blocked_amount, interest_rate, iban)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, extension_no, status || 'open', account_name, currency_code || 'TRY',
       balance || 0, blocked_amount || 0, interest_rate || 0, iban]
    );

    // Fetch the inserted row (MySQL doesn't support RETURNING)
    const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ?', [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/accounts/:id - Update account
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM accounts WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existing.length === 0) {
      throw createError(404, 'Hesap bulunamadı.');
    }

    const errors = validateAccount(req.body);
    if (errors.length > 0) {
      throw createError(400, errors.join(' '));
    }

    const {
      extension_no, status, account_name, currency_code,
      balance, blocked_amount, interest_rate, iban,
    } = req.body;

    await pool.query(
      `UPDATE accounts SET
        extension_no = ?, status = ?, account_name = ?, currency_code = ?,
        balance = ?, blocked_amount = ?, interest_rate = ?, iban = ?
       WHERE id = ?`,
      [extension_no, status, account_name, currency_code, balance, blocked_amount, interest_rate, iban, id]
    );

    // Fetch updated row (MySQL doesn't support RETURNING)
    const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ?', [id]);

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/accounts/:id - Soft delete account
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // SELECT before soft-delete (only non-deleted records)
    const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ? AND deleted_at IS NULL', [id]);
    if (rows.length === 0) {
      throw createError(404, 'Hesap bulunamadı.');
    }

    await pool.query('UPDATE accounts SET deleted_at = NOW() WHERE id = ?', [id]);

    res.json({ message: 'Hesap başarıyla silindi.', account: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
