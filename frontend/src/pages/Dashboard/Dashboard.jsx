import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, exportCustomersUrl, exportTerminalsUrl } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Yükleniyor...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📊</div>
          <div>
            <div className="stat-value">{stats?.openTerminals ?? 0}</div>
            <div className="stat-label">Açık Terminal</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">🔒</div>
          <div>
            <div className="stat-value">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats?.totalBlockedAmount ?? 0)}
            </div>
            <div className="stat-label">Toplam Bloke Tutar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👤</div>
          <div>
            <div className="stat-value">{stats?.todayCustomers ?? 0}</div>
            <div className="stat-label">Bugün Eklenen Müşteri</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🏢</div>
          <div>
            <div className="stat-value">{stats?.totalCustomers ?? 0}</div>
            <div className="stat-label">Toplam Müşteri</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Hızlı İşlemler</div>
        </div>
        <div className="btn-group">
          <Link to="/customers/new" className="btn btn-primary">+ Yeni Müşteri</Link>
          <Link to="/customers" className="btn btn-secondary">Müşteri Listesi</Link>
          <a href={exportCustomersUrl} className="btn btn-secondary">📥 Müşteri Excel</a>
          <a href={exportTerminalsUrl} className="btn btn-secondary">📥 Terminal Excel</a>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🖥️</div>
          <div>
            <div className="stat-value">{stats?.totalTerminals ?? 0}</div>
            <div className="stat-label">Toplam Terminal</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🏬</div>
          <div>
            <div className="stat-value">{stats?.totalWorkplaces ?? 0}</div>
            <div className="stat-label">Toplam İşyeri</div>
          </div>
        </div>
      </div>
    </div>
  );
}
