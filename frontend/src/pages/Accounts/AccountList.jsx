import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAccountsByCustomer, getAccounts, getCustomer, deleteAccount } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal/Modal';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

export default function AccountList() {
  const { customerId } = useParams();
  const isGlobal = !customerId;
  const [accounts, setAccounts] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useApp();

  function load() {
    setLoading(true);
    const promises = isGlobal
      ? [getAccounts()]
      : [getAccountsByCustomer(customerId), getCustomer(customerId).then(c => { setCustomer(c); return c; })];

    Promise.all(promises)
      .then(([accs]) => { setAccounts(accs); })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [customerId]);

  async function handleDelete() {
    try {
      await deleteAccount(deleteTarget.id);
      showToast('Hesap silindi.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const currencySymbol = code => ({ TRY: '₺', USD: '$', EUR: '€', GBP: '£' }[code] || code);

  return (
    <div>
      {isGlobal ? (
        <Breadcrumb items={[{ label: 'Tüm Hesaplar' }]} />
      ) : (
        <Breadcrumb items={[
          { label: 'Müşteriler', path: '/customers' },
          { label: customer ? `${customer.first_name} ${customer.last_name}` : '...', path: customerId ? `/customers/${customerId}` : undefined },
          { label: 'Hesaplar' },
        ]} />
      )}

      <div className="card-header">
        <div className="card-title">
          {isGlobal ? 'Tüm Hesaplar' : <>Hesaplar {customer && <span style={{color:'var(--text-light)',fontWeight:400}}>— {customer.first_name} {customer.last_name} ({customer.customer_no})</span>}</>}
        </div>
        <div className="btn-group">
          {isGlobal ? (
            <Link to="/customers" className="btn btn-secondary">← Müşterilere Dön</Link>
          ) : (
            <>
              <Link to={`/customers/${customerId}`} className="btn btn-secondary">← Müşteri Detay</Link>
              <Link to={`/customers/${customerId}/accounts/new`} className="btn btn-primary">+ Yeni Hesap</Link>
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
                  <th>Ek No</th>
                  <th>Hesap Adı</th>
                  <th>Döviz</th>
                  <th>Bakiye</th>
                  <th>Bloke Tutar</th>
                  <th>Faiz Oranı</th>
                  <th>IBAN</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr><td colSpan={isGlobal ? 10 : 9}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      <p>Henüz hesap yok.</p>
                      {!isGlobal && <Link to={`/customers/${customerId}/accounts/new`} className="btn btn-primary">+ Yeni Hesap Ekle</Link>}
                    </div>
                  </td></tr>
                ) : accounts.map(a => (
                  <tr key={a.id}>
                    {isGlobal && <td><Link to={`/customers/${a.customer_id}`} style={{color:'var(--text)',textDecoration:'none'}}>{a.first_name} {a.last_name} <span style={{color:'var(--text-light)',fontSize:11}}>({a.customer_no})</span></Link></td>}
                    <td>{a.extension_no}</td>
                    <td>{a.account_name}</td>
                    <td>{a.currency_code}</td>
                    <td>{currencySymbol(a.currency_code)}{parseFloat(a.balance).toLocaleString('tr-TR', {minimumFractionDigits:2})}</td>
                    <td>{currencySymbol(a.currency_code)}{parseFloat(a.blocked_amount).toLocaleString('tr-TR', {minimumFractionDigits:2})}</td>
                    <td>%{a.interest_rate}</td>
                    <td style={{fontFamily:'monospace',fontSize:12}}>{a.iban}</td>
                    <td><span className={`badge ${a.status === 'open' ? 'badge-success' : 'badge-danger'}`}>{a.status === 'open' ? 'Açık' : 'Kapalı'}</span></td>
                    <td>
                      <div className="actions">
                        {!isGlobal && <Link to={`/customers/${customerId}/accounts/${a.id}/edit`} className="btn btn-primary btn-sm">Düzenle</Link>}
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(a)}>Sil</button>
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
        <Modal title="Hesabı Sil" onClose={() => setDeleteTarget(null)}>
          <p><strong>{deleteTarget.account_name}</strong> hesabı silinecek. Emin misiniz?</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>İptal</button>
            <button className="btn btn-danger" onClick={handleDelete}>Sil</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
