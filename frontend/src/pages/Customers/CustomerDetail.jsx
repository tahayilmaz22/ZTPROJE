import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCustomer, getAccountsByCustomer, getWorkplacesByCustomer, deleteCustomer } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal/Modal';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

const EDUCATION_LEVELS = [
  'Okur Yazar Değil', 'Okur Yazar', 'İlkokul', 'Ortaokul',
  'Lise', 'Ön Lisans', 'Lisans', 'Yüksek Lisans', 'Doktora',
];

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    Promise.all([
      getCustomer(id),
      getAccountsByCustomer(id),
      getWorkplacesByCustomer(id),
    ])
      .then(([cust, accs, wps]) => {
        setCustomer(cust);
        setAccounts(accs);
        setWorkplaces(wps);
      })
      .catch(err => {
        showToast(err.message, 'error');
        navigate('/customers');
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    try {
      await deleteCustomer(id);
      showToast('Müşteri silindi.');
      navigate('/customers');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (!customer) return null;

  const isIndividual = customer.customer_type === 'individual';

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Müşteriler', path: '/customers' },
        { label: `${customer.first_name} ${customer.last_name}` },
      ]} />

      {/* Header */}
      <div className="card-header">
        <div className="card-title">
          {customer.first_name} {customer.last_name}
          <span className={`badge ${isIndividual ? 'badge-info' : 'badge-warning'}`} style={{marginLeft:12}}>
            {isIndividual ? 'Gerçek Müşteri' : 'Tüzel Müşteri'}
          </span>
        </div>
        <div className="btn-group">
          <Link to="/customers" className="btn btn-secondary">← Listeye Dön</Link>
          <Link to={`/customers/${id}/edit`} className="btn btn-primary">Düzenle</Link>
          <button className="btn btn-danger" onClick={() => setShowDelete(true)}>Sil</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        {/* Common Info */}
        <div className="card">
          <h4 style={{marginBottom:16,color:'var(--primary)'}}>Genel Bilgiler</h4>
          <div className="detail-grid">
            <div><label>Müşteri No</label><div><strong>{customer.customer_no}</strong></div></div>
            <div><label>Ünvan</label><div>{customer.title || '-'}</div></div>
            <div><label>Telefon</label><div>{customer.phone || '-'}</div></div>
            <div><label>E-posta</label><div>{customer.email || '-'}</div></div>
            <div><label>Kayıt Tarihi</label><div>{new Date(customer.registration_date).toLocaleString('tr-TR')}</div></div>
            <div className="full-width"><label>Adres</label><div>{customer.address || '-'}</div></div>
          </div>
        </div>

        {/* Type-specific Info */}
        <div className="card">
          <h4 style={{marginBottom:16,color:'var(--primary)'}}>
            {isIndividual ? 'Gerçek Müşteri Bilgileri' : 'Tüzel Müşteri Bilgileri'}
          </h4>
          {isIndividual ? (
            <div className="detail-grid">
              <div><label>TC Kimlik No</label><div><strong>{customer.tc_kimlik_no || '-'}</strong></div></div>
              <div><label>Baba Adı</label><div>{customer.father_name || '-'}</div></div>
              <div><label>Anne Adı</label><div>{customer.mother_name || '-'}</div></div>
              <div><label>Doğum Tarihi</label><div>{customer.birth_date ? new Date(customer.birth_date).toLocaleDateString('tr-TR') : '-'}</div></div>
              <div><label>Doğum Yeri</label><div>{customer.birth_place || '-'}</div></div>
              <div><label>Cinsiyet</label><div>{customer.gender === 'E' ? 'Erkek' : customer.gender === 'K' ? 'Kadın' : '-'}</div></div>
              <div><label>Öğrenim Durumu</label><div>{customer.education_level || '-'}</div></div>
              <div><label>Medeni Durum</label><div>{customer.marital_status || '-'}</div></div>
            </div>
          ) : (
            <div className="detail-grid">
              <div><label>Vergi Kimlik No</label><div><strong>{customer.tax_id_no || '-'}</strong></div></div>
              <div><label>Kamu Durumu</label><div><span className={`badge ${customer.is_public ? 'badge-success' : 'badge-danger'}`}>{customer.is_public ? 'Evet' : 'Hayır'}</span></div></div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid" style={{marginTop:0}}>
        <div className="stat-card" style={{cursor:'pointer'}} onClick={() => navigate(`/customers/${id}/accounts`)}>
          <div className="stat-icon blue">💳</div>
          <div>
            <div className="stat-value">{accounts.length}</div>
            <div className="stat-label">Hesap</div>
          </div>
        </div>
        <div className="stat-card" style={{cursor:'pointer'}} onClick={() => navigate(`/customers/${id}/workplaces`)}>
          <div className="stat-icon green">🏢</div>
          <div>
            <div className="stat-value">{workplaces.length}</div>
            <div className="stat-label">İşyeri</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Hızlı İşlemler</div>
        </div>
        <div className="btn-group">
          <Link to={`/customers/${id}/accounts`} className="btn btn-primary">💳 Hesaplar ({accounts.length})</Link>
          <Link to={`/customers/${id}/accounts/new`} className="btn btn-secondary">+ Yeni Hesap</Link>
          <Link to={`/customers/${id}/workplaces`} className="btn btn-primary">🏢 İşyerleri ({workplaces.length})</Link>
          <Link to={`/customers/${id}/workplaces/new`} className="btn btn-secondary">+ Yeni İşyeri</Link>
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <Modal title="Müşteriyi Sil" onClose={() => setShowDelete(false)}>
          <p><strong>{customer.first_name} {customer.last_name}</strong> ({customer.customer_no}) ve tüm bağlı hesapları, işyerleri silinecek. Emin misiniz?</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>İptal</button>
            <button className="btn btn-danger" onClick={handleDelete}>Sil</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
