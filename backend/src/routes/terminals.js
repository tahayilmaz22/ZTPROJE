const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { validateTerminal } = require('../utils/validators');
const { createError } = require('../middleware/errorHandler');

// GET /api/workplaces/:workplaceId/terminals - List terminals for a workplace
router.get('/workplaces/:workplaceId/terminals', async (req, res, next) => {
  try {
    const { workplaceId } = req.params;
    const [rows] = await pool.query(
      `SELECT t.*, w.name AS workplace_name, w.workplace_no
       FROM terminals t
       JOIN workplaces w ON t.workplace_id = w.id
       WHERE t.workplace_id = ?
       ORDER BY t.id DESC`,
      [workplaceId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/terminals - List all terminals
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, w.name AS workplace_name, w.workplace_no,
        w.customer_id, c.customer_no, c.first_name, c.last_name
       FROM terminals t
       JOIN workplaces w ON t.workplace_id = w.id
       JOIN customers c ON w.customer_id = c.id
       ORDER BY t.id DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/terminals/:id - Get single terminal
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT t.*, w.name AS workplace_name, w.workplace_no
       FROM terminals t
       JOIN workplaces w ON t.workplace_id = w.id
       WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw createError(404, 'Terminal bulunamadı.');
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/workplaces/:workplaceId/terminals - Create terminal
router.post('/workplaces/:workplaceId/terminals', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { workplaceId } = req.params;

    const [wpCheck] = await conn.query('SELECT id FROM workplaces WHERE id = ?', [workplaceId]);
    if (wpCheck.length === 0) {
      throw createError(404, 'İşyeri bulunamadı.');
    }

    const errors = validateTerminal(req.body, false);
    if (errors.length > 0) {
      throw createError(400, errors.join(' '));
    }

    const [noResult] = await conn.query(
      "SELECT CONCAT('T-', LPAD(COALESCE(MAX(CAST(SUBSTRING(terminal_id, 3) AS UNSIGNED)), 0) + 1, 6, '0')) AS new_id FROM terminals"
    );
    const terminal_id = noResult[0].new_id;

    const {
      registration_status, contact_name, contact_phone, contact_email,
      usage_type, model_code, service_company, serial_no,
    } = req.body;

    // On create, closure_reason is always null (hidden)
    const [result] = await conn.query(
      `INSERT INTO terminals (terminal_id, workplace_id, registration_status, contact_name, contact_phone,
        contact_email, usage_type, model_code, service_company, serial_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [terminal_id, workplaceId, registration_status ?? 1, contact_name, contact_phone,
       contact_email, usage_type, model_code, service_company, serial_no]
    );

    const terminalDbId = result.insertId;

    // Log creation
    await conn.query(
      `INSERT INTO operation_logs (entity_type, entity_id, action, new_value, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      ['terminal', terminalDbId, 'create', `Terminal oluşturuldu: ${terminal_id}`, 'system']
    );

    // Fetch the inserted row with joins
    const [rows] = await conn.query(
      `SELECT t.*, w.name AS workplace_name, w.workplace_no
       FROM terminals t
       JOIN workplaces w ON t.workplace_id = w.id
       WHERE t.id = ?`,
      [terminalDbId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
});

// PUT /api/terminals/:id - Update terminal (with status change logging + closure reason rule)
router.put('/:id', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const [existing] = await conn.query('SELECT * FROM terminals WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw createError(404, 'Terminal bulunamadı.');
    }

    const oldTerminal = existing[0];

    // Validate with isUpdate=true (enforces closure_reason when status=0)
    const errors = validateTerminal(req.body, true);
    if (errors.length > 0) {
      throw createError(400, errors.join(' '));
    }

    const {
      registration_status, contact_name, contact_phone, contact_email,
      usage_type, model_code, service_company, serial_no, closure_reason,
    } = req.body;

    await conn.query(
      `UPDATE terminals SET
        registration_status = ?, contact_name = ?, contact_phone = ?, contact_email = ?,
        usage_type = ?, model_code = ?, service_company = ?, serial_no = ?,
        closure_reason = ?
       WHERE id = ?`,
      [registration_status, contact_name, contact_phone, contact_email,
       usage_type, model_code, service_company, serial_no,
       registration_status === 0 ? closure_reason : null, id]
    );

    // Log status change
    const statusLabels = { 0: 'Kapalı', 1: 'Açık', 2: 'Kurulum Bekliyor' };
    if (oldTerminal.registration_status !== registration_status) {
      await conn.query(
        `INSERT INTO operation_logs (entity_type, entity_id, action, old_value, new_value, changed_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['terminal', id, 'status_change',
         statusLabels[oldTerminal.registration_status] || oldTerminal.registration_status.toString(),
         statusLabels[registration_status] || registration_status.toString(),
         'system']
      );
    }

    // Fetch updated row
    const [rows] = await conn.query(
      `SELECT t.*, w.name AS workplace_name, w.workplace_no
       FROM terminals t
       JOIN workplaces w ON t.workplace_id = w.id
       WHERE t.id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
});

// DELETE /api/terminals/:id - Delete terminal
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // SELECT before DELETE (MySQL doesn't support RETURNING)
    const [rows] = await pool.query('SELECT * FROM terminals WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw createError(404, 'Terminal bulunamadı.');
    }

    await pool.query('DELETE FROM terminals WHERE id = ?', [id]);

    res.json({ message: 'Terminal başarıyla silindi.', terminal: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
