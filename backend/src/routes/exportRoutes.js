const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const pool = require('../config/db');

// GET /api/export/customers - Export customers to Excel
router.get('/customers', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.customer_no, c.customer_type, c.first_name, c.last_name, c.title,
              c.registration_date, c.address, c.phone, c.email,
              ic.tc_kimlik_no, ic.father_name, ic.mother_name, ic.birth_date,
              ic.birth_place, ic.gender, ic.education_level, ic.marital_status,
              cc.tax_id_no, CASE WHEN cc.is_public THEN 'Evet' ELSE 'Hayır' END AS kamu_durumu
       FROM customers c
       LEFT JOIN individual_customers ic ON c.id = ic.customer_id
       LEFT JOIN corporate_customers cc ON c.id = cc.customer_id
       WHERE c.deleted_at IS NULL
       ORDER BY c.id`
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Müşteriler');

    sheet.columns = [
      { header: 'Müşteri No', key: 'customer_no', width: 15 },
      { header: 'Tip', key: 'customer_type', width: 12 },
      { header: 'Ad', key: 'first_name', width: 20 },
      { header: 'Soyad', key: 'last_name', width: 20 },
      { header: 'Ünvan', key: 'title', width: 25 },
      { header: 'Kayıt Tarihi', key: 'registration_date', width: 20 },
      { header: 'Adres', key: 'address', width: 30 },
      { header: 'Telefon', key: 'phone', width: 18 },
      { header: 'E-posta', key: 'email', width: 25 },
      { header: 'TC Kimlik No', key: 'tc_kimlik_no', width: 15 },
      { header: 'Baba Adı', key: 'father_name', width: 20 },
      { header: 'Anne Adı', key: 'mother_name', width: 20 },
      { header: 'Doğum Tarihi', key: 'birth_date', width: 15 },
      { header: 'Doğum Yeri', key: 'birth_place', width: 20 },
      { header: 'Cinsiyet', key: 'gender', width: 10 },
      { header: 'Öğrenim Durumu', key: 'education_level', width: 20 },
      { header: 'Medeni Durum', key: 'marital_status', width: 15 },
      { header: 'Vergi No', key: 'tax_id_no', width: 18 },
      { header: 'Kamu', key: 'kamu_durumu', width: 10 },
    ];

    sheet.addRows(rows);

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
});

// GET /api/export/terminals - Export terminals to Excel
router.get('/terminals', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.terminal_id, t.serial_no, t.registration_status,
              t.contact_name, t.contact_phone, t.contact_email,
              t.usage_type, t.model_code, t.service_company, t.closure_reason,
              w.name AS workplace_name, w.workplace_no,
              c.customer_no, c.first_name, c.last_name
       FROM terminals t
       JOIN workplaces w ON t.workplace_id = w.id
       JOIN customers c ON w.customer_id = c.id
       WHERE t.deleted_at IS NULL AND w.deleted_at IS NULL AND c.deleted_at IS NULL
       ORDER BY t.id`
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Terminaller');

    const statusLabels = { 0: 'Kapalı', 1: 'Açık', 2: 'Kurulum Bekliyor' };

    sheet.columns = [
      { header: 'Terminal ID', key: 'terminal_id', width: 15 },
      { header: 'Seri No', key: 'serial_no', width: 18 },
      { header: 'Kayıt Durumu', key: 'registration_status', width: 18 },
      { header: 'İşyeri', key: 'workplace_name', width: 25 },
      { header: 'İşyeri No', key: 'workplace_no', width: 15 },
      { header: 'Müşteri No', key: 'customer_no', width: 15 },
      { header: 'Müşteri Ad', key: 'first_name', width: 20 },
      { header: 'Müşteri Soyad', key: 'last_name', width: 20 },
      { header: 'İlgili Kişi', key: 'contact_name', width: 20 },
      { header: 'İletişim Tel', key: 'contact_phone', width: 18 },
      { header: 'İletişim E-posta', key: 'contact_email', width: 25 },
      { header: 'Kullanım Tipi', key: 'usage_type', width: 18 },
      { header: 'Model Kodu', key: 'model_code', width: 15 },
      { header: 'Servis Firması', key: 'service_company', width: 25 },
      { header: 'Kapanma Nedeni', key: 'closure_reason', width: 25 },
    ];

    // Map status to labels
    const mappedRows = rows.map(row => ({
      ...row,
      registration_status: statusLabels[row.registration_status] || row.registration_status,
    }));

    sheet.addRows(mappedRows);

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=terminals.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
