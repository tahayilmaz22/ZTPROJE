const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { validateCustomer } = require('../utils/validators');
const { createError } = require('../middleware/errorHandler');

// GET /api/customers - List all customers
router.get('/', async (req, res, next) => {
  try {
    const { type, search } = req.query;
    let query = `
      SELECT c.*,
        ic.tc_kimlik_no, ic.father_name, ic.mother_name, ic.birth_date,
        ic.birth_place, ic.gender, ic.education_level, ic.marital_status,
        cc.is_public, cc.tax_id_no
      FROM customers c
      LEFT JOIN individual_customers ic ON c.id = ic.customer_id
      LEFT JOIN corporate_customers cc ON c.id = cc.customer_id
      WHERE 1=1
    `;
    const params = [];

    query += ' AND c.deleted_at IS NULL';

    if (type) {
      params.push(type);
      query += ` AND c.customer_type = ?`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.customer_no LIKE ?)`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    query += ' ORDER BY c.id DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id - Get single customer with details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT c.*,
        ic.tc_kimlik_no, ic.father_name, ic.mother_name, ic.birth_date,
        ic.birth_place, ic.gender, ic.education_level, ic.marital_status,
        cc.is_public, cc.tax_id_no
      FROM customers c
      LEFT JOIN individual_customers ic ON c.id = ic.customer_id
      LEFT JOIN corporate_customers cc ON c.id = cc.customer_id
      WHERE c.id = ? AND c.deleted_at IS NULL`,
      [id]
    );

    if (rows.length === 0) {
      throw createError(404, 'Müşteri bulunamadı.');
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers - Create customer
router.post('/', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const errors = validateCustomer(req.body);
    if (errors.length > 0) {
      throw createError(400, errors.join(' '));
    }

    const {
      customer_type, first_name, last_name, title, address, phone, email,
      tc_kimlik_no, father_name, mother_name, birth_date, birth_place,
      gender, education_level, marital_status,
      is_public, tax_id_no,
    } = req.body;

    await conn.beginTransaction();

    // Generate customer_no
    const [noResult] = await conn.query(
      "SELECT CONCAT('M-', LPAD(COALESCE(MAX(CAST(SUBSTRING(customer_no, 3) AS UNSIGNED)), 0) + 1, 6, '0')) AS new_no FROM customers"
    );
    const customer_no = noResult[0].new_no;

    // Insert base customer
    const [custResult] = await conn.query(
      `INSERT INTO customers (customer_no, customer_type, first_name, last_name, title, address, phone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_no, customer_type, first_name, last_name, title, address, phone, email]
    );
    const customerId = custResult.insertId;

    // Insert type-specific details
    if (customer_type === 'individual') {
      await conn.query(
        `INSERT INTO individual_customers (customer_id, tc_kimlik_no, father_name, mother_name, birth_date, birth_place, gender, education_level, marital_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerId, tc_kimlik_no, father_name, mother_name, birth_date, birth_place, gender, education_level, marital_status]
      );
    } else {
      await conn.query(
        `INSERT INTO corporate_customers (customer_id, is_public, tax_id_no)
         VALUES (?, ?, ?)`,
        [customerId, is_public || false, tax_id_no]
      );
    }

    await conn.commit();

    // Fetch full customer with details
    const [fullRows] = await conn.query(
      `SELECT c.*,
        ic.tc_kimlik_no, ic.father_name, ic.mother_name, ic.birth_date,
        ic.birth_place, ic.gender, ic.education_level, ic.marital_status,
        cc.is_public, cc.tax_id_no
      FROM customers c
      LEFT JOIN individual_customers ic ON c.id = ic.customer_id
      LEFT JOIN corporate_customers cc ON c.id = cc.customer_id
      WHERE c.id = ?`,
      [customerId]
    );

    res.status(201).json(fullRows[0]);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;

    // Check if customer exists
    const [existing] = await conn.query('SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL', [id]);
    if (existing.length === 0) {
      throw createError(404, 'Müşteri bulunamadı.');
    }

    const {
      customer_type, first_name, last_name, title, address, phone, email,
      tc_kimlik_no, father_name, mother_name, birth_date, birth_place,
      gender, education_level, marital_status,
      is_public, tax_id_no,
    } = req.body;

    await conn.beginTransaction();

    // Update base customer
    await conn.query(
      `UPDATE customers SET
        customer_type = ?, first_name = ?, last_name = ?, title = ?,
        address = ?, phone = ?, email = ?, updated_at = NOW()
       WHERE id = ?`,
      [customer_type, first_name, last_name, title, address, phone, email, id]
    );

    // Update type-specific details
    if (customer_type === 'individual') {
      // Delete corporate if switching type
      await conn.query('DELETE FROM corporate_customers WHERE customer_id = ?', [id]);

      await conn.query(
        `INSERT INTO individual_customers (customer_id, tc_kimlik_no, father_name, mother_name, birth_date, birth_place, gender, education_level, marital_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           tc_kimlik_no = VALUES(tc_kimlik_no), father_name = VALUES(father_name),
           mother_name = VALUES(mother_name), birth_date = VALUES(birth_date),
           birth_place = VALUES(birth_place), gender = VALUES(gender),
           education_level = VALUES(education_level), marital_status = VALUES(marital_status)`,
        [id, tc_kimlik_no, father_name, mother_name, birth_date, birth_place, gender, education_level, marital_status]
      );
    } else {
      // Delete individual if switching type
      await conn.query('DELETE FROM individual_customers WHERE customer_id = ?', [id]);

      await conn.query(
        `INSERT INTO corporate_customers (customer_id, is_public, tax_id_no)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE is_public = VALUES(is_public), tax_id_no = VALUES(tax_id_no)`,
        [id, is_public || false, tax_id_no]
      );
    }

    await conn.commit();

    const [fullRows] = await conn.query(
      `SELECT c.*,
        ic.tc_kimlik_no, ic.father_name, ic.mother_name, ic.birth_date,
        ic.birth_place, ic.gender, ic.education_level, ic.marital_status,
        cc.is_public, cc.tax_id_no
      FROM customers c
      LEFT JOIN individual_customers ic ON c.id = ic.customer_id
      LEFT JOIN corporate_customers cc ON c.id = cc.customer_id
      WHERE c.id = ?`,
      [id]
    );

    res.json(fullRows[0]);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// DELETE /api/customers/:id - Soft delete customer
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // SELECT before soft-delete (only non-deleted records)
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL', [id]);
    if (rows.length === 0) {
      throw createError(404, 'Müşteri bulunamadı.');
    }

    await pool.query('UPDATE customers SET deleted_at = NOW() WHERE id = ?', [id]);

    res.json({ message: 'Müşteri başarıyla silindi.', customer: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
