const express = require('express');
const cors = require('cors');
require('dotenv').config();

const customerRoutes = require('./routes/customers');
const accountRoutes = require('./routes/accounts');
const workplaceRoutes = require('./routes/workplaces');
const terminalRoutes = require('./routes/terminals');
const searchRoutes = require('./routes/search');
const logRoutes = require('./routes/logs');
const dashboardRoutes = require('./routes/dashboard');
const exportRoutes = require('./routes/exportRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/workplaces', workplaceRoutes);
app.use('/api/terminals', terminalRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);

// Main API landing page
app.get('/api', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Müşteri / Hesap / İşyeri / Terminal Yönetim Sistemi - API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #1a1a2e; line-height: 1.6; }
    .container { max-width: 960px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #16213e; }
    .subtitle { color: #555; margin-bottom: 32px; font-size: 15px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: #fff; border-radius: 10px; padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,.08); border-left: 4px solid #4472C4; transition: transform .15s, box-shadow .15s; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
    .card h3 { font-size: 16px; margin-bottom: 10px; color: #16213e; }
    .card .method { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-right: 6px; color: #fff; }
    .method.get { background: #2e7d32; } .method.post { background: #1565c0; } .method.put { background: #e65100; } .method.delete { background: #c62828; }
    .card .path { font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; color: #444; word-break: break-all; }
    .card .desc { font-size: 13px; color: #666; margin-top: 6px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 32px; }
    .stat { background: linear-gradient(135deg, #4472C4, #5878c7); color: #fff; padding: 18px 20px; border-radius: 10px; text-align: center; }
    .stat .value { font-size: 32px; font-weight: 700; }
    .stat .label { font-size: 13px; opacity: .85; margin-top: 4px; }
    .health { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #2e7d32; margin-bottom: 24px; }
    .health .dot { width: 10px; height: 10px; background: #2e7d32; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
    footer { text-align: center; font-size: 12px; color: #999; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏢 Müşteri / Hesap / İşyeri / Terminal Yönetim Sistemi</h1>
    <p class="subtitle">REST API — Node.js + Express + MySQL</p>
    <div class="health"><span class="dot"></span> API çalışıyor</div>

    <div class="cards">
      <div class="card">
        <h3><span class="method get">GET</span> Müşteriler</h3>
        <div class="path">/api/customers</div>
        <div class="desc">Tüm müşterileri listeler. <code>?type=individual|corporate</code> ve <code>?search=</code> filtreleri.</div>
      </div>
      <div class="card">
        <h3><span class="method post">POST</span> Müşteri Ekle</h3>
        <div class="path">/api/customers</div>
        <div class="desc">Yeni gerçek/tüzel müşteri oluşturur. TC Kimlik No algoritmik doğrulama içerir.</div>
      </div>
      <div class="card">
        <h3><span class="method get">GET</span> Hesaplar</h3>
        <div class="path">/api/accounts</div>
        <div class="desc">Tüm hesapları müşteri bilgileriyle birlikte listeler.</div>
      </div>
      <div class="card">
        <h3><span class="method post">POST</span> Hesap Ekle</h3>
        <div class="path">/api/customers/:id/accounts</div>
        <div class="desc">Müşteriye yeni hesap tanımlar. IBAN format kontrolü yapılır.</div>
      </div>
      <div class="card">
        <h3><span class="method get">GET</span> İşyerleri</h3>
        <div class="path">/api/workplaces</div>
        <div class="desc">Tüm işyerlerini listeler. Müşteri bazlı filtreleme: <code>/api/customers/:id/workplaces</code></div>
      </div>
      <div class="card">
        <h3><span class="method get">GET</span> Terminaller</h3>
        <div class="path">/api/terminals</div>
        <div class="desc">Tüm terminalleri işyeri ve müşteri bilgileriyle listeler.</div>
      </div>
      <div class="card">
        <h3><span class="method put">PUT</span> Terminal Güncelle</h3>
        <div class="path">/api/terminals/:id</div>
        <div class="desc">Terminal durumu günceller. Kapalı seçilirse kapanma nedeni zorunludur.</div>
      </div>
      <div class="card">
        <h3><span class="method get">GET</span> Global Arama</h3>
        <div class="path">/api/search?q=</div>
        <div class="desc">Müşteri no, isim, terminal seri no ile tüm sistemde arama yapar.</div>
      </div>
      <div class="card">
        <h3><span class="method get">GET</span> İşlem Geçmişi</h3>
        <div class="path">/api/logs</div>
        <div class="desc">Terminal/işyeri durum değişikliklerini kim, ne zaman yaptı bilgisiyle listeler.</div>
      </div>
      <div class="card">
        <h3><span class="method get">GET</span> Dashboard</h3>
        <div class="path">/api/dashboard/stats</div>
        <div class="desc">Açık terminal, bloke tutar, bugün eklenen müşteri sayısı gibi özet istatistikler.</div>
      </div>
      <div class="card">
        <h3><span class="method get">GET</span> Export (Excel)</h3>
        <div class="path">/api/export/customers | /api/export/terminals</div>
        <div class="desc">Müşteri ve terminal listelerini Excel (.xlsx) formatında indirir.</div>
      </div>
      <div class="card">
        <h3><span class="method get">GET</span> Health Check</h3>
        <div class="path">/api/health</div>
        <div class="desc">API durumunu ve sunucu zamanını döner.</div>
      </div>
    </div>

    <div class="stats">
      <div class="stat"><div class="value">REST</div><div class="label">Mimari</div></div>
      <div class="stat"><div class="value">MySQL</div><div class="label">Veritabanı</div></div>
      <div class="stat"><div class="value">12</div><div class="label">Endpoint</div></div>
      <div class="stat"><div class="value">Excel</div><div class="label">Export</div></div>
    </div>

    <footer>Staj Projesi &copy; ${new Date().getFullYear()} — Node.js + Express + MySQL</footer>
  </div>
</body>
</html>`);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app;
