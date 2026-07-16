import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer, exportCustomersUrl } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal/Modal';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useApp();

  function load() {
    setLoading(true);
    const params = {};
    if (filter) params.type = filter;
    getCustomers(params)
      .then(setCustomers)
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filter]);

  async function handleDelete() {
    try {
      await deleteCustomer(deleteTarget.id);
      showToast('Müşteri silindi.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const typeLabel = t => t === 'individual' ? 'Gerçek' : 'Tüzel';

  return (
    <div>
      <div className="card-header">
        <div className="card-title">Müşteriler</div>
        <div className="btn-group">
          <select className="form-control" style={{width:'auto'}} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">Tümü</option>
            <option value="individual">Gerçek</option>
            <option value="corporate">Tüzel</option>
          </select>
          <a href={exportCustomersUrl} className="btn btn-secondary">📥 Excel</a>
          <Link to="/customers/new" className="btn btn-primary">+ Yeni Müşteri</Link>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Yükleniyor...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Müşteri No</th>
                  <th>Tip</th>
                  <th>Ad</th>
                  <th>Soyad</th>
                  <th>Telefon</th>
                  <th>E-posta</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <p>Henüz müşteri kaydı yok.</p>
                      <Link to="/customers/new" className="btn btn-primary">+ Yeni Müşteri Ekle</Link>
                    </div>
                  </td></tr>
                ) : customers.map(c => (
                  <tr key={c.id}>
                    <td><Link to={`/customers/${c.id}`} style={{fontWeight:600,color:'var(--primary)',textDecoration:'none'}}>{c.customer_no}</Link></td>
                    <td><span className={`badge ${c.customer_type === 'individual' ? 'badge-info' : 'badge-warning'}`}>{typeLabel(c.customer_type)}</span></td>
                    <td><Link to={`/customers/${c.id}`} style={{color:'var(--text)',textDecoration:'none'}}>{c.first_name}</Link></td>
                    <td><Link to={`/customers/${c.id}`} style={{color:'var(--text)',textDecoration:'none'}}>{c.last_name}</Link></td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>{new Date(c.registration_date).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <div className="actions">
                        <Link to={`/customers/${c.id}/edit`} className="btn btn-primary btn-sm">Düzenle</Link>
                        <Link to={`/customers/${c.id}/accounts`} className="btn btn-secondary btn-sm">Hesaplar</Link>
                        <Link to={`/customers/${c.id}/workplaces`} className="btn btn-secondary btn-sm">İşyerleri</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(c)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <Modal title="Müşteriyi Sil" onClose={() => setDeleteTarget(null)}>
          <p><strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong> ({deleteTarget.customer_no}) silinecek. Emin misiniz?</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>İptal</button>
            <button className="btn btn-danger" onClick={handleDelete}>Sil</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
