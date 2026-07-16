const { validateTCKimlikNo } = require('./tcKimlikValidator');
const { validateIBAN } = require('./ibanValidator');

function validateCustomer(body) {
  const errors = [];

  if (!body.customer_type || !['individual', 'corporate'].includes(body.customer_type)) {
    errors.push('Müşteri tipi "individual" veya "corporate" olmalıdır.');
  }

  if (!body.first_name || !body.first_name.trim()) {
    errors.push('Ad zorunludur.');
  }

  if (!body.last_name || !body.last_name.trim()) {
    errors.push('Soyad zorunludur.');
  }

  if (!body.phone || !body.phone.trim()) {
    errors.push('Telefon zorunludur.');
  }

  if (!body.email || !body.email.trim()) {
    errors.push('E-posta zorunludur.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('Geçerli bir e-posta adresi giriniz.');
  }

  if (body.customer_type === 'individual') {
    if (!body.tc_kimlik_no) {
      errors.push('TC Kimlik No zorunludur.');
    } else {
      const tcResult = validateTCKimlikNo(body.tc_kimlik_no);
      if (!tcResult.valid) {
        errors.push(tcResult.message);
      }
    }

    if (!body.gender || !['E', 'K'].includes(body.gender)) {
      errors.push('Cinsiyet "E" veya "K" olmalıdır.');
    }

    if (!body.birth_date) {
      errors.push('Doğum tarihi zorunludur.');
    }

    if (!body.birth_place || !body.birth_place.trim()) {
      errors.push('Doğum yeri zorunludur.');
    }
  }

  if (body.customer_type === 'corporate') {
    if (!body.tax_id_no || !body.tax_id_no.trim()) {
      errors.push('Vergi Kimlik No zorunludur.');
    }
  }

  return errors;
}

function validateAccount(body) {
  const errors = [];

  if (!body.account_name || !body.account_name.trim()) {
    errors.push('Hesap adı zorunludur.');
  }

  if (!body.currency_code) {
    errors.push('Döviz kodu zorunludur.');
  }

  if (body.iban) {
    const ibanResult = validateIBAN(body.iban);
    if (!ibanResult.valid) {
      errors.push(ibanResult.message);
    }
  }

  if (body.balance !== undefined && isNaN(parseFloat(body.balance))) {
    errors.push('Bakiye geçerli bir sayı olmalıdır.');
  }

  return errors;
}

function validateWorkplace(body) {
  const errors = [];

  if (!body.name || !body.name.trim()) {
    errors.push('İşyeri adı zorunludur.');
  }

  if (!body.manager || !body.manager.trim()) {
    errors.push('Yönetici zorunludur.');
  }

  if (!body.workplace_type || !['normal', 'virtual'].includes(body.workplace_type)) {
    errors.push('İşyeri tipi "normal" veya "virtual" olmalıdır.');
  }

  return errors;
}

function validateTerminal(body, isUpdate = false) {
  const errors = [];

  if (!body.serial_no || !body.serial_no.trim()) {
    errors.push('Seri no zorunludur.');
  }

  if (!body.model_code || !body.model_code.trim()) {
    errors.push('Model kodu zorunludur.');
  }

  // On update, if status is 0 (closed), closure reason is required
  if (isUpdate && body.registration_status === 0) {
    if (!body.closure_reason || !body.closure_reason.trim()) {
      errors.push('Kayıt durumu "Kapalı" seçildiğinde kapanma nedeni zorunludur.');
    }
  }

  if (![0, 1, 2].includes(body.registration_status)) {
    errors.push('Kayıt durumu 0, 1 veya 2 olmalıdır.');
  }

  return errors;
}

module.exports = { validateCustomer, validateAccount, validateWorkplace, validateTerminal };
