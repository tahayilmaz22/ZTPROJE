import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTerminal, createTerminal, updateTerminal } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

export default function TerminalForm() {
  const { workplaceId, id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [form, setForm] = useState({
    registration_status: 1,
    contact_name: '', contact_phone: '', contact_email: '',
    usage_type: '', model_code: '', service_company: '', serial_no: '',
    closure_reason: '',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getTerminal(id).then(t => {
        setForm({
          registration_status: t.registration_status ?? 1,
          contact_name: t.contact_name || '',
          contact_phone: t.contact_phone || '',
          contact_email: t.contact_email || '',
          usage_type: t.usage_type || '',
          model_code: t.model_code || '',
          service_company: t.service_company || '',
          serial_no: t.serial_no || '',
          closure_reason: t.closure_reason || '',
        });
      }).catch(err => {
        showToast(err.message, 'error');
        navigate(`/workplaces/${workplaceId}/terminals`);
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

    // Don't send closure_reason on create
    const payload = { ...form };
    if (!isEdit) {
      delete payload.closure_reason;
    }
    // On update, only include closure_reason if status is 0
    if (isEdit && form.registration_status !== 0) {
      delete payload.closure_reason;
    }

    try {
      if (isEdit) {
        await updateTerminal(id, payload);
        showToast('Terminal güncellendi.');
      } else {
        await createTerminal(workplaceId, payload);
        showToast('Terminal oluşturuldu.');
      }
      navigate(`/workplaces/${workplaceId}/terminals`);
    } catch (err) {
      setErrors([err.message]);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  // Show closure reason only on update AND when status is 0 (closed)
  const showClosureReason = isEdit && form.registration_status === 0;

  return (
    <div>
      <Breadcrumb items={[
        { label: 'İşyerleri', path: '/workplaces' },
        { label: 'Terminaller', path: `/workplaces/${workplaceId}/terminals` },
        { label: isEdit ? 'Terminal Düzenle' : 'Yeni Terminal' },
      ]} />

      <div className="card-header">
        <div className="card-title">{isEdit ? 'Terminal Düzenle' : 'Yeni Terminal'}</div>
        <button className="btn btn-secondary" onClick={() => navigate(`/workplaces/${workplaceId}/terminals`)}>← Listeye Dön</button>
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
              <label>Seri No <span className="required">*</span></label>
              <input className="form-control" value={form.serial_no} onChange={e => update('serial_no', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Model Kodu <span className="required">*</span></label>
              <input className="form-control" value={form.model_code} onChange={e => update('model_code', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Kayıt Durumu</label>
              <select className="form-control" value={form.registration_status} onChange={e => update('registration_status', parseInt(e.target.value))}>
                <option value={1}>Açık</option>
                <option value={0}>Kapalı</option>
                <option value={2}>Kurulum Bekliyor</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>İlgili Kişi</label>
              <input className="form-control" value={form.contact_name} onChange={e => update('contact_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>İletişim Telefon</label>
              <input className="form-control" value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>İletişim E-posta</label>
              <input className="form-control" type="email" value={form.contact_email} onChange={e => update('contact_email', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kullanım Tipi</label>
              <input className="form-control" value={form.usage_type} onChange={e => update('usage_type', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Servis Firması</label>
              <input className="form-control" value={form.service_company} onChange={e => update('service_company', e.target.value)} />
            </div>
          </div>

          {/* Closure reason - only visible on update when status is 0 */}
          {showClosureReason && (
            <div className="form-group">
              <label>Kapanma Nedeni <span className="required">*</span></label>
              <input className="form-control" value={form.closure_reason} onChange={e => update('closure_reason', e.target.value)} required />
            </div>
          )}

          <div className="btn-group" style={{marginTop:20}}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/workplaces/${workplaceId}/terminals`)}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
