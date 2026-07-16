import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccount, createAccount, updateAccount } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

export default function AccountForm() {
  const { customerId, id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [form, setForm] = useState({
    extension_no: '', account_name: '', currency_code: 'TRY',
    balance: '0', blocked_amount: '0', interest_rate: '0',
    iban: '', status: 'open',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getAccount(id).then(a => {
        setForm({
          extension_no: a.extension_no || '',
          account_name: a.account_name || '',
          currency_code: a.currency_code || 'TRY',
          balance: a.balance?.toString() || '0',
          blocked_amount: a.blocked_amount?.toString() || '0',
          interest_rate: a.interest_rate?.toString() || '0',
          iban: a.iban || '',
          status: a.status || 'open',
        });
      }).catch(err => {
        showToast(err.message, 'error');
        navigate(`/customers/${customerId}/accounts`);
      });
    }
  }, [id]);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    const payload = {
      ...form,
      balance: parseFloat(form.balance) || 0,
      blocked_amount: parseFloat(form.blocked_amount) || 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
    };

    try {
      if (isEdit) {
        await updateAccount(id, payload);
        showToast('Hesap güncellendi.');
      } else {
        await createAccount(customerId, payload);
        showToast('Hesap oluşturuldu.');
      }
      navigate(`/customers/${customerId}/accounts`);
    } catch (err) {
      setErrors([err.message]);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Müşteriler', path: '/customers' },
        { label: 'Hesaplar', path: `/customers/${customerId}/accounts` },
        { label: isEdit ? 'Hesap Düzenle' : 'Yeni Hesap' },
      ]} />

      <div className="card-header">
        <div className="card-title">{isEdit ? 'Hesap Düzenle' : 'Yeni Hesap'}</div>
        <button className="btn btn-secondary" onClick={() => navigate(`/customers/${customerId}/accounts`)}>← Listeye Dön</button>
      </div>

      <div className="card">
        {errors.length > 0 && (
          <div style={{background:'#f8d7da',color:'#721c24',padding:12,borderRadius:6,marginBottom:16}}>
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Ek No</label>
              <input className="form-control" value={form.extension_no} onChange={e => update('extension_no', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Hesap Adı <span className="required">*</span></label>
              <input className="form-control" value={form.account_name} onChange={e => update('account_name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Döviz Kodu <span className="required">*</span></label>
              <select className="form-control" value={form.currency_code} onChange={e => update('currency_code', e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bakiye</label>
              <input className="form-control" type="number" step="0.01" value={form.balance} onChange={e => update('balance', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bloke Tutar</label>
              <input className="form-control" type="number" step="0.01" value={form.blocked_amount} onChange={e => update('blocked_amount', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Faiz Oranı (%)</label>
              <input className="form-control" type="number" step="0.01" value={form.interest_rate} onChange={e => update('interest_rate', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>IBAN</label>
              <input className="form-control" value={form.iban} onChange={e => update('iban', e.target.value)} placeholder="TR__ ____ ____ ____ ____ ____ __" maxLength={34} />
            </div>
            <div className="form-group">
              <label>Durum</label>
              <select className="form-control" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="open">Açık</option>
                <option value="closed">Kapalı</option>
              </select>
            </div>
          </div>

          <div className="btn-group" style={{marginTop:20}}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/customers/${customerId}/accounts`)}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
