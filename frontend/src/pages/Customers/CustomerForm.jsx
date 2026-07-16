import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer, createCustomer, updateCustomer } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { maskTCKimlik, unmaskTCKimlik, maskPhone, unmaskPhone } from '../../utils/masks';

const EDUCATION_LEVELS = [
  'Okur Yazar Değil', 'Okur Yazar', 'İlkokul', 'Ortaokul',
  'Lise', 'Ön Lisans', 'Lisans', 'Yüksek Lisans', 'Doktora',
];

const MARITAL_STATUSES = ['Bekar', 'Evli', 'Boşanmış', 'Dul'];

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [form, setForm] = useState({
    customer_type: 'individual',
    first_name: '', last_name: '', title: '', address: '', phone: '', email: '',
    tc_kimlik_no: '', father_name: '', mother_name: '', birth_date: '',
    birth_place: '', gender: 'E', education_level: '', marital_status: '',
    is_public: false, tax_id_no: '',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Input display values for masked fields
  const [tcDisplay, setTcDisplay] = useState('');
  const [phoneDisplay, setPhoneDisplay] = useState('');

  useEffect(() => {
    if (isEdit) {
      getCustomer(id).then(c => {
        setForm({
          customer_type: c.customer_type || 'individual',
          first_name: c.first_name || '',
          last_name: c.last_name || '',
          title: c.title || '',
          address: c.address || '',
          phone: c.phone || '',
          email: c.email || '',
          tc_kimlik_no: c.tc_kimlik_no || '',
          father_name: c.father_name || '',
          mother_name: c.mother_name || '',
          birth_date: c.birth_date ? c.birth_date.slice(0, 10) : '',
          birth_place: c.birth_place || '',
          gender: c.gender || 'E',
          education_level: c.education_level || '',
          marital_status: c.marital_status || '',
          is_public: c.is_public || false,
          tax_id_no: c.tax_id_no || '',
        });
        if (c.tc_kimlik_no) setTcDisplay(maskTCKimlik(c.tc_kimlik_no));
        if (c.phone) setPhoneDisplay(maskPhone(c.phone));
      }).catch(err => {
        showToast(err.message, 'error');
        navigate('/customers');
      });
    }
  }, [id]);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  }

  function handleTcChange(e) {
    const masked = maskTCKimlik(e.target.value);
    setTcDisplay(masked);
    update('tc_kimlik_no', unmaskTCKimlik(masked));
  }

  function handlePhoneChange(e) {
    const masked = maskPhone(e.target.value);
    setPhoneDisplay(masked);
    update('phone', unmaskPhone(masked));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    // Build payload
    const payload = { ...form };

    try {
      if (isEdit) {
        await updateCustomer(id, payload);
        showToast('Müşteri güncellendi.');
      } else {
        await createCustomer(payload);
        showToast('Müşteri oluşturuldu.');
      }
      navigate('/customers');
    } catch (err) {
      setErrors([err.message]);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="card-header">
        <div className="card-title">{isEdit ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/customers')}>← Listeye Dön</button>
      </div>

      <div className="card">
        {errors.length > 0 && (
          <div style={{background:'#f8d7da', color:'#721c24', padding:12, borderRadius:6, marginBottom:16}}>
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Müşteri Tipi <span className="required">*</span></label>
              <select className="form-control" value={form.customer_type} onChange={e => update('customer_type', e.target.value)}>
                <option value="individual">Gerçek</option>
                <option value="corporate">Tüzel</option>
              </select>
            </div>
          </div>

          {/* Common fields */}
          <div className="form-row">
            <div className="form-group">
              <label>Ad <span className="required">*</span></label>
              <input className="form-control" value={form.first_name} onChange={e => update('first_name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Soyad <span className="required">*</span></label>
              <input className="form-control" value={form.last_name} onChange={e => update('last_name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Ünvan</label>
              <input className="form-control" value={form.title} onChange={e => update('title', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefon <span className="required">*</span></label>
              <input className="form-control" value={phoneDisplay} onChange={handlePhoneChange} placeholder="(5__) ___ __ __" required />
            </div>
            <div className="form-group">
              <label>E-posta <span className="required">*</span></label>
              <input className="form-control" type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Adres</label>
            <textarea className="form-control" rows={3} value={form.address} onChange={e => update('address', e.target.value)} />
          </div>

          {/* Individual-specific fields */}
          {form.customer_type === 'individual' && (
            <>
              <h4 style={{margin: '20px 0 12px', color: 'var(--primary)'}}>Gerçek Müşteri Bilgileri</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>TC Kimlik No <span className="required">*</span></label>
                  <input className="form-control" value={tcDisplay} onChange={handleTcChange} placeholder="___ ___ ___ __" maxLength={14} required />
                </div>
                <div className="form-group">
                  <label>Baba Adı</label>
                  <input className="form-control" value={form.father_name} onChange={e => update('father_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Anne Adı</label>
                  <input className="form-control" value={form.mother_name} onChange={e => update('mother_name', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Doğum Tarihi <span className="required">*</span></label>
                  <input className="form-control" type="date" value={form.birth_date} onChange={e => update('birth_date', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Doğum Yeri <span className="required">*</span></label>
                  <input className="form-control" value={form.birth_place} onChange={e => update('birth_place', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Cinsiyet <span className="required">*</span></label>
                  <select className="form-control" value={form.gender} onChange={e => update('gender', e.target.value)}>
                    <option value="E">Erkek</option>
                    <option value="K">Kadın</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Öğrenim Durumu</label>
                  <select className="form-control" value={form.education_level} onChange={e => update('education_level', e.target.value)}>
                    <option value="">Seçiniz</option>
                    {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Medeni Durum</label>
                  <select className="form-control" value={form.marital_status} onChange={e => update('marital_status', e.target.value)}>
                    <option value="">Seçiniz</option>
                    {MARITAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Corporate-specific fields */}
          {form.customer_type === 'corporate' && (
            <>
              <h4 style={{margin: '20px 0 12px', color: 'var(--primary)'}}>Tüzel Müşteri Bilgileri</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Vergi Kimlik No <span className="required">*</span></label>
                  <input className="form-control" value={form.tax_id_no} onChange={e => update('tax_id_no', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Kamu Durumu</label>
                  <select className="form-control" value={form.is_public} onChange={e => update('is_public', e.target.value === 'true')}>
                    <option value="false">Hayır</option>
                    <option value="true">Evet</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="btn-group" style={{marginTop:20}}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/customers')}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
