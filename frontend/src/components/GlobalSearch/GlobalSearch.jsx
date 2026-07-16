import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalSearch } from '../../services/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const debounce = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);

    if (debounce.current) clearTimeout(debounce.current);

    if (val.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    debounce.current = setTimeout(async () => {
      try {
        const data = await globalSearch(val);
        setResults(data);
        setOpen(true);
      } catch {
        setResults(null);
      }
    }, 300);
  }

  const statusLabels = { 0: 'Kapalı', 1: 'Açık', 2: 'Kurulum Bekliyor' };

  const hasResults = results && (
    (results.customers?.length || 0) + (results.terminals?.length || 0) + (results.workplaces?.length || 0) > 0
  );

  return (
    <div className="search-box" ref={ref}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        placeholder="Müşteri no, isim veya seri no ile ara..."
        value={query}
        onChange={handleChange}
        onFocus={() => results && setOpen(true)}
      />
      {open && results && (
        <div className="search-results">
          {!hasResults && (
            <div className="search-result-item" style={{color:'#999'}}>Sonuç bulunamadı.</div>
          )}
          {results.customers?.slice(0, 5).map(c => (
            <div
              key={`c-${c.id}`}
              className="search-result-item"
              onClick={() => { setOpen(false); setQuery(''); navigate(`/customers/${c.id}`); }}
            >
              <div className="title">{c.first_name} {c.last_name}</div>
              <div className="sub">Müşteri No: {c.customer_no} | {c.phone}</div>
            </div>
          ))}
          {results.workplaces?.slice(0, 3).map(w => (
            <div
              key={`w-${w.id}`}
              className="search-result-item"
              onClick={() => { setOpen(false); setQuery(''); navigate(`/customers/${w.customer_id}/workplaces`); }}
            >
              <div className="title">🏢 {w.name}</div>
              <div className="sub">İşyeri No: {w.workplace_no} | {w.customer_no} | {w.manager}</div>
            </div>
          ))}
          {results.terminals?.slice(0, 5).map(t => (
            <div
              key={`t-${t.id}`}
              className="search-result-item"
              onClick={() => { setOpen(false); setQuery(''); navigate(`/workplaces/${t.workplace_id}/terminals`); }}
            >
              <div className="title">🖥️ {t.terminal_id} - {t.serial_no}</div>
              <div className="sub">
                {t.workplace_name} | {t.customer_no} | {statusLabels[t.registration_status]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
