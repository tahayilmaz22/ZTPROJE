import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTerminalsByWorkplace, getTerminals, getWorkplace, deleteTerminal, exportTerminalsUrl } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal/Modal';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

const STATUS_MAP = { 0: 'Kapalı', 1: 'Açık', 2: 'Kurulum Bekliyor' };
const STATUS_BADGE = { 0: 'badge-danger', 1: 'badge-success', 2: 'badge-warning' };

export default function TerminalList() {
  const { workplaceId } = useParams();
  const isGlobal = !workplaceId;
  const [terminals, setTerminals] = useState([]);
  const [workplace, setWorkplace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useApp();

  function load() {
    setLoading(true);
    const promises = isGlobal
      ? [getTerminals()]
      : [getTerminalsByWorkplace(workplaceId), getWorkplace(workplaceId).then(wp => { setWorkplace(wp); return wp; })];

    Promise.all(promises)
      .then(([terms]) => { setTerminals(terms); })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [workplaceId]);

  async function handleDelete() {
    try {
      await deleteTerminal(deleteTarget.id);
      showToast('Terminal silindi.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div>
      {isGlobal ? (
        <Breadcrumb items={[{ label: 'Tüm Terminaller' }]} />
      ) : (
        <Breadcrumb items={[
          { label: 'Müşteriler', path: '/customers' },
          { label: workplace ? `${workplace.name}` : '...', path: workplace?.customer_id ? `/customers/${workplace.customer_id}/workplaces` : undefined },
          { label: 'Terminaller' },
        ]} />
      )}

      <div className="card-header">
        <div className="card-title">
          {isGlobal ? 'Tüm Terminaller' : <>Terminaller {workplace && <span style={{color:'var(--text-light)',fontWeight:400}}>— {workplace.name} ({workplace.workplace_no})</span>}</>}
        </div>
        <div className="btn-group">
          {isGlobal ? (
            <>
              <a href={exportTerminalsUrl} className="btn btn-secondary">📥 Excel</a>
              <Link to="/workplaces" className="btn btn-secondary">← İşyerlerine Dön</Link>
            </>
          ) : (
            <>
              <a href={exportTerminalsUrl} className="btn btn-secondary">📥 Excel</a>
              <Link to={workplace?.customer_id ? `/customers/${workplace.customer_id}/workplaces` : '/customers'} className="btn btn-secondary">← İşyerleri</Link>
              <Link to={`/workplaces/${workplaceId}/terminals/new`} className="btn btn-primary">+ Yeni Terminal</Link>
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
                  {isGlobal && <th>İşyeri</th>}
                  <th>Terminal ID</th>
                  <th>Seri No</th>
                  <th>Model</th>
                  <th>Kullanım Tipi</th>
                  <th>Servis Firması</th>
                  <th>İlgili Kişi</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {terminals.length === 0 ? (
                  <tr><td colSpan={isGlobal ? 10 : 8}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      <p>Henüz terminal yok.</p>
                      {!isGlobal && <Link to={`/workplaces/${workplaceId}/terminals/new`} className="btn btn-primary">+ Yeni Terminal Ekle</Link>}
                    </div>
                  </td></tr>
                ) : terminals.map(t => (
                  <tr key={t.id}>
                    {isGlobal && <td><Link to={`/customers/${t.customer_id || ''}`} style={{color:'var(--text)',textDecoration:'none'}}>{t.customer_no && `${t.first_name} ${t.last_name}`}</Link></td>}
                    {isGlobal && <td><Link to={`/workplaces/${t.workplace_id}/terminals`} style={{color:'var(--text)',textDecoration:'none'}}>{t.workplace_name}</Link></td>}
                    <td><strong>{t.terminal_id}</strong></td>
                    <td>{t.serial_no}</td>
                    <td>{t.model_code}</td>
                    <td>{t.usage_type}</td>
                    <td>{t.service_company}</td>
                    <td>{t.contact_name}</td>
                    <td><span className={`badge ${STATUS_BADGE[t.registration_status]}`}>{STATUS_MAP[t.registration_status]}</span></td>
                    <td>
                      <div className="actions">
                        <Link to={`/workplaces/${t.workplace_id || workplaceId}/terminals/${t.id}/edit`} className="btn btn-primary btn-sm">Düzenle</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(t)}>Sil</button>
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
        <Modal title="Terminali Sil" onClose={() => setDeleteTarget(null)}>
          <p><strong>{deleteTarget.terminal_id}</strong> ({deleteTarget.serial_no}) silinecek. Emin misiniz?</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>İptal</button>
            <button className="btn btn-danger" onClick={handleDelete}>Sil</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
