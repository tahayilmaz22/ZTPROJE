import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWorkplacesByCustomer, getWorkplaces, getCustomer, deleteWorkplace } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal/Modal';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

export default function WorkplaceList() {
  const { customerId } = useParams();
  const isGlobal = !customerId;
  const [workplaces, setWorkplaces] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useApp();

  function load() {
    setLoading(true);
    const promises = isGlobal
      ? [getWorkplaces()]
      : [getWorkplacesByCustomer(customerId), getCustomer(customerId).then(c => { setCustomer(c); return c; })];

    Promise.all(promises)
      .then(([wps]) => { setWorkplaces(wps); })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [customerId]);

  async function handleDelete() {
    try {
      await deleteWorkplace(deleteTarget.id);
      showToast('İşyeri silindi.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div>
      {isGlobal ? (
        <Breadcrumb items={[{ label: 'Tüm İşyerleri' }]} />
      ) : (
        <Breadcrumb items={[
          { label: 'Müşteriler', path: '/customers' },
          { label: customer ? `${customer.first_name} ${customer.last_name}` : '...', path: customerId ? `/customers/${customerId}` : undefined },
          { label: 'İşyerleri' },
        ]} />
      )}

      <div className="card-header">
        <div className="card-title">
          {isGlobal ? 'Tüm İşyerleri' : <>İşyerleri {customer && <span style={{color:'var(--text-light)',fontWeight:400}}>— {customer.first_name} {customer.last_name} ({customer.customer_no})</span>}</>}
        </div>
        <div className="btn-group">
          {isGlobal ? (
            <Link to="/customers" className="btn btn-secondary">← Müşterilere Dön</Link>
          ) : (
            <>
              <Link to={`/customers/${customerId}`} className="btn btn-secondary">← Müşteri Detay</Link>
              <Link to={`/customers/${customerId}/workplaces/new`} className="btn btn-primary">+ Yeni İşyeri</Link>
            </>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Yükleniyor...</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {isGlobal && <th>Müşteri</th>}
                  <th>İşyeri No</th>
                  <th>Ad</th>
                  <th>Yönetici</th>
                  <th>Tip</th>
                  <th>Komisyon (%)</th>
                  <th>Bloke Gün</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {workplaces.length === 0 ? (
                  <tr><td colSpan={isGlobal ? 9 : 8}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>
                      <p>Henüz işyeri yok.</p>
                      {!isGlobal && <Link to={`/customers/${customerId}/workplaces/new`} className="btn btn-primary">+ Yeni İşyeri Ekle</Link>}
                    </div>
                  </td></tr>
                ) : workplaces.map(w => (
                  <tr key={w.id}>
                    {isGlobal && <td><Link to={`/customers/${w.customer_id}`} style={{color:'var(--text)',textDecoration:'none'}}>{w.first_name} {w.last_name} <span style={{color:'var(--text-light)',fontSize:11}}>({w.customer_no})</span></Link></td>}
                    <td><strong>{w.workplace_no}</strong></td>
                    <td>{w.name}</td>
                    <td>{w.manager}</td>
                    <td><span className={`badge ${w.workplace_type === 'normal' ? 'badge-info' : 'badge-warning'}`}>{w.workplace_type === 'normal' ? 'Normal' : 'Sanal'}</span></td>
                    <td>%{w.commission_rate}</td>
                    <td>{w.block_day} gün</td>
                    <td><span className={`badge ${w.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{w.status === 'active' ? 'Aktif' : 'Pasif'}</span></td>
                    <td>
                      <div className="actions">
                        <Link to={`/workplaces/${w.id}/terminals`} className="btn btn-secondary btn-sm">Terminaller</Link>
                        {!isGlobal && <Link to={`/customers/${customerId}/workplaces/${w.id}/edit`} className="btn btn-primary btn-sm">Düzenle</Link>}
                        {isGlobal && <Link to={`/customers/${w.customer_id}/workplaces/${w.id}/edit`} className="btn btn-primary btn-sm">Düzenle</Link>}
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(w)}>Sil</button>
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
        <Modal title="İşyerini Sil" onClose={() => setDeleteTarget(null)}>
          <p><strong>{deleteTarget.name}</strong> ({deleteTarget.workplace_no}) silinecek. Emin misiniz?</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>İptal</button>
            <button className="btn btn-danger" onClick={handleDelete}>Sil</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
