import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkplace, createWorkplace, updateWorkplace } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

export default function WorkplaceForm() {
  const { customerId, id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [form, setForm] = useState({
    name: '', status: 'active', partners: '', manager: '',
    address_line1: '', address_line2: '', city: '', district: '', postal_code: '',
    tax_tc_no: '', workplace_type: 'normal', commission_rate: '0', block_day: '0',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getWorkplace(id).then(w => {
        setForm({
          name: w.name || '',
          status: w.status || 'active',
          partners: w.partners || '',
          manager: w.manager || '',
          address_line1: w.address_line1 || '',
          address_line2: w.address_line2 || '',
          city: w.city || '',
          district: w.district || '',
          postal_code: w.postal_code || '',
          tax_tc_no: w.tax_tc_no || '',
          workplace_type: w.workplace_type || 'normal',
          commission_rate: w.commission_rate?.toString() || '0',
          block_day: w.block_day?.toString() || '0',
        });
      }).catch(err => {
        showToast(err.message, 'error');
        navigate(`/customers/${customerId}/workplaces`);
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
      commission_rate: parseFloat(form.commission_rate) || 0,
      block_day: parseInt(form.block_day) || 0,
    };

    try {
      if (isEdit) {
        await updateWorkplace(id, payload);
        showToast('İşyeri güncellendi.');
      } else {
        await createWorkplace(customerId, payload);
        showToast('İşyeri oluşturuldu.');
      }
      navigate(`/customers/${customerId}/workplaces`);
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
        { label: 'İşyerleri', path: `/customers/${customerId}/workplaces` },
        { label: isEdit ? 'İşyeri Düzenle' : 'Yeni İşyeri' },
      ]} />

      <div className="card-header">
        <div className="card-title">{isEdit ? 'İşyeri Düzenle' : 'Yeni İşyeri'}</div>
        <button className="btn btn-secondary" onClick={() => navigate(`/customers/${customerId}/workplaces`)}>← Listeye Dön</button>
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
              <label>Ad <span className="required">*</span></label>
              <input className="form-control" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Yönetici <span className="required">*</span></label>
              <input className="form-control" value={form.manager} onChange={e => update('manager', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Ortaklar</label>
              <input className="form-control" value={form.partners} onChange={e => update('partners', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Adres Satır 1</label>
              <input className="form-control" value={form.address_line1} onChange={e => update('address_line1', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Adres Satır 2</label>
              <input className="form-control" value={form.address_line2} onChange={e => update('address_line2', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>İl</label>
              <input className="form-control" value={form.city} onChange={e => update('city', e.target.value)} />
            </div>
            <div className="form-group">
              <label>İlçe</label>
              <input className="form-control" value={form.district} onChange={e => update('district', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Posta Kodu</label>
              <input className="form-control" value={form.postal_code} onChange={e => update('postal_code', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vergi/TC No</label>
              <input className="form-control" value={form.tax_tc_no} onChange={e => update('tax_tc_no', e.target.value)} />
            </div>
            <div className="form-group">
              <label>İşyeri Tipi <span className="required">*</span></label>
              <select className="form-control" value={form.workplace_type} onChange={e => update('workplace_type', e.target.value)}>
                <option value="normal">Normal</option>
                <option value="virtual">Sanal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Durum</label>
              <select className="form-control" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Komisyon Oranı (%)</label>
              <input className="form-control" type="number" step="0.01" value={form.commission_rate} onChange={e => update('commission_rate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bloke Gün</label>
              <input className="form-control" type="number" value={form.block_day} onChange={e => update('block_day', e.target.value)} />
            </div>
          </div>

          <div className="btn-group" style={{marginTop:20}}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/customers/${customerId}/workplaces`)}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
