import { useState, useEffect } from 'react';
import { getLogs } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function LogList() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const { showToast } = useApp();
  const limit = 20;

  function load() {
    setLoading(true);
    const params = { limit, offset: page * limit };
    if (filter) params.entity_type = filter;
    getLogs(params)
      .then(data => { setLogs(data.logs); setTotal(data.total); })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filter, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="card-header">
        <div className="card-title">İşlem Geçmişi</div>
        <div className="btn-group">
          <select className="form-control" style={{width:'auto'}} value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }}>
            <option value="">Tümü</option>
            <option value="terminal">Terminal</option>
            <option value="workplace">İşyeri</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Yükleniyor...</div> : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Varlık Tipi</th>
                    <th>Varlık ID</th>
                    <th>İşlem</th>
                    <th>Eski Değer</th>
                    <th>Yeni Değer</th>
                    <th>Değiştiren</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={8}>
                      <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        <p>Henüz işlem kaydı yok.</p>
                      </div>
                    </td></tr>
                  ) : logs.map(l => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td><span className={`badge ${l.entity_type === 'terminal' ? 'badge-info' : 'badge-warning'}`}>{l.entity_type === 'terminal' ? 'Terminal' : 'İşyeri'}</span></td>
                      <td>{l.entity_id}</td>
                      <td>
                        <span className={`badge ${l.action === 'create' ? 'badge-success' : l.action === 'status_change' ? 'badge-warning' : 'badge-info'}`}>
                          {l.action === 'create' ? 'Oluşturma' : l.action === 'status_change' ? 'Durum Değişikliği' : l.action}
                        </span>
                      </td>
                      <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.old_value || '-'}</td>
                      <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.new_value || '-'}</td>
                      <td>{l.changed_by}</td>
                      <td>{new Date(l.changed_at).toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="btn-group" style={{marginTop:16,justifyContent:'center'}}>
                <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Önceki</button>
                <span style={{padding:'4px 12px',fontSize:14}}>Sayfa {page + 1} / {totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
