const { validateCustomer, validateAccount, validateWorkplace, validateTerminal } = require('./validators');
const { validateTCKimlikNo } = require('./tcKimlikValidator');
const { validateIBAN } = require('./ibanValidator');

// =============================================================================
// validateTCKimlikNo — Unit Tests
// =============================================================================
describe('validateTCKimlikNo', () => {
  // Use an algorithmically valid TC number for happy-path tests.
  // Algorithm: 10000000146
  //   digits: [1,0,0,0,0,0,0,0,1,4,6]
  //   oddSum  (idx 1,3,5,7,9) = 1+0+0+0+1 = 2
  //   evenSum (idx 2,4,6,8)   = 0+0+0+0 = 0
  //   10th = ((2*7)-0)%10 = 4  ✓
  //   sumFirst10 = 1+0+0+0+0+0+0+0+1+4 = 6 → 11th = 6%10 = 6 ✓
  const VALID_TC = '10000000146';

  describe('valid inputs', () => {
    it('should accept a valid 11-digit TC number', () => {
      const result = validateTCKimlikNo(VALID_TC);
      expect(result.valid).toBe(true);
    });

    it('should return success message for valid TC', () => {
      const result = validateTCKimlikNo(VALID_TC);
      expect(result.message).toBe('Geçerli TC Kimlik No.');
    });

    it('should accept TC number where 10th digit is 0', () => {
      // 10000000003: digits=[1,0,0,0,0,0,0,0,0,0,3]
      // oddSum=1+0+0+0+0=1, evenSum=0+0+0+0=0
      // 10th=((1*7)-0)%10=7%10=7 → FAIL
      // Let's find another: 10100000102
      // digits=[1,0,1,0,0,0,0,0,1,0,2]
      // oddSum=1+1+0+0+1=3, evenSum=0+0+0+0=0
      // 10th=((3*7)-0)%10=21%10=1 → FAIL
      // 10700000165:
      // digits=[1,0,7,0,0,0,0,0,1,6,5]
      // oddSum=1+7+0+0+1=9, evenSum=0+0+0+0=0
      // 10th=((9*7)-0)%10=63%10=3 → FAIL
      // 10900000145:
      // digits=[1,0,9,0,0,0,0,0,1,4,5]
      // oddSum=1+9+0+0+1=11, evenSum=0+0+0+0=0
      // 10th=((11*7)-0)%10=77%10=7 → FAIL
      // Let's try: 10100000128
      // digits=[1,0,1,0,0,0,0,0,1,2,8]
      // oddSum=1+1+0+0+1=3, evenSum=0+0+0+0=0
      // 10th=((3*7)-0)%10=21%10=1 → FAIL
      // Let's use a real known valid one: Ataturk's TC no is reported as 10000000146
      // Let's try: 12345678900
      // digits=[1,2,3,4,5,6,7,8,9,0,0]
      // oddSum=1+3+5+7+9=25, evenSum=2+4+6+8=20
      // 10th=((25*7)-20)%10=(175-20)%10=155%10=5 ≠ 0 → FAIL
      // So we need: 10th = ((oddSum*7)-evenSum)%10
      // Let oddSum=2, evenSum=1: ((2*7)-1)%10=13%10=3 → 10th=3
      // Let's use number starting with 2: 210000001XX
      // digits=[2,1,0,0,0,0,0,0,1,3,?]
      // oddSum=2+0+0+0+1=3, evenSum=1+0+0+0=1
      // 10th=((3*7)-1)%10=(21-1)%10=20%10=0 ✓
      // sumFirst10=2+1+0+0+0+0+0+0+1+0=4 → 11th=4
      // Valid: 21000000104
      const anotherValid = '21000000104';
      const result = validateTCKimlikNo(anotherValid);
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid inputs — empty / falsy', () => {
    it('should reject empty string', () => {
      const result = validateTCKimlikNo('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('TC Kimlik No 11 haneli olmalıdır.');
    });

    it('should reject null / undefined', () => {
      const result = validateTCKimlikNo(null);
      expect(result.valid).toBe(false);
    });

    it('should reject undefined', () => {
      const result = validateTCKimlikNo(undefined);
      expect(result.valid).toBe(false);
    });
  });

  describe('invalid inputs — length', () => {
    it('should reject fewer than 11 digits', () => {
      const result = validateTCKimlikNo('1234567890'); // 10 digits
      expect(result.valid).toBe(false);
      expect(result.message).toBe('TC Kimlik No 11 haneli olmalıdır.');
    });

    it('should reject more than 11 digits', () => {
      const result = validateTCKimlikNo('123456789012'); // 12 digits
      expect(result.valid).toBe(false);
      expect(result.message).toBe('TC Kimlik No 11 haneli olmalıdır.');
    });
  });

  describe('invalid inputs — non-digit characters', () => {
    it('should reject letters', () => {
      const result = validateTCKimlikNo('1234567890A');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('TC Kimlik No sadece rakamlardan oluşmalıdır.');
    });

    it('should reject special characters', () => {
      const result = validateTCKimlikNo('12345-78901');
      expect(result.valid).toBe(false);
    });

    it('should reject spaces', () => {
      const result = validateTCKimlikNo('123456 8901');
      expect(result.valid).toBe(false);
    });
  });

  describe('invalid inputs — leading zero', () => {
    it('should reject TC number starting with 0', () => {
      const result = validateTCKimlikNo('01234567890');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('TC Kimlik No ilk hanesi 0 olamaz.');
    });
  });

  describe('invalid inputs — checksum failures', () => {
    it('should reject TC number with wrong 11th (sum) digit', () => {
      // VALID_TC = 10000000146, change last digit
      const result = validateTCKimlikNo('10000000145');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Geçersiz TC Kimlik No: 11. hane kontrolü başarısız.');
    });

    it('should reject TC number with wrong 10th (algorithm) digit', () => {
      // 10000000157: digits=[1,0,0,0,0,0,0,0,1,5,7]
      // 11th check: sumFirst10=1+0+0+0+0+0+0+0+1+5=7, 7%10=7=digit[10] ✓
      // 10th check: ((oddSum*7)-evenSum)%10 where oddSum=1+0+0+0+1=2, evenSum=0
      //   ((2*7)-0)%10=4, but digit[9]=5 → 4≠5 → FAIL
      const result = validateTCKimlikNo('10000000157');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Geçersiz TC Kimlik No: 10. hane kontrolü başarısız.');
    });
  });
});

// =============================================================================
// validateIBAN — Unit Tests
// =============================================================================
describe('validateIBAN', () => {
  // Known valid IBANs (mod 97 check passes)
  const VALID_TR_IBAN = 'TR330006100519786457841326';
  const VALID_GB_IBAN = 'GB29NWBK60161331926819';

  describe('valid inputs', () => {
    it('should accept a valid Turkish IBAN', () => {
      const result = validateIBAN(VALID_TR_IBAN);
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Geçerli IBAN.');
    });

    it('should accept a valid non-Turkish IBAN that passes mod 97', () => {
      const result = validateIBAN(VALID_GB_IBAN);
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Geçerli IBAN.');
    });

    it('should accept IBAN with spaces', () => {
      const result = validateIBAN('TR33 0006 1005 1978 6457 8413 26');
      expect(result.valid).toBe(true);
    });

    it('should accept IBAN with lowercase letters', () => {
      const result = validateIBAN('tr330006100519786457841326');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid inputs — empty / falsy', () => {
    it('should reject empty string', () => {
      const result = validateIBAN('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('IBAN zorunludur.');
    });

    it('should reject null', () => {
      const result = validateIBAN(null);
      expect(result.valid).toBe(false);
    });

    it('should reject undefined', () => {
      const result = validateIBAN(undefined);
      expect(result.valid).toBe(false);
    });
  });

  describe('invalid inputs — length', () => {
    it('should reject IBAN shorter than 5 characters', () => {
      const result = validateIBAN('TR00');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('IBAN uzunluğu geçersiz.');
    });

    it('should reject IBAN longer than 34 characters', () => {
      const result = validateIBAN('A'.repeat(35));
      expect(result.valid).toBe(false);
      expect(result.message).toBe('IBAN uzunluğu geçersiz.');
    });
  });

  describe('invalid inputs — Turkish IBAN specific', () => {
    it('should reject Turkish IBAN that is not exactly 26 chars', () => {
      const result = validateIBAN('TR33000610051978645784132'); // 24 chars
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Türkiye IBAN numarası 26 karakter olmalıdır (TR + 24 hane).');
    });

    it('should reject Turkish IBAN with non-digit suffix', () => {
      const result = validateIBAN('TR33000610051978645784132A');
      // 26 chars but last char is a letter not a digit
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Türkiye IBAN formatı: TR + 24 rakam.');
    });
  });

  describe('invalid inputs — mod 97 failure', () => {
    it('should reject IBAN that fails mod 97 check', () => {
      // Same length as valid GB IBAN but with wrong digits
      const result = validateIBAN('GB29NWBK60161331926810');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('IBAN doğrulama başarısız (mod 97 kontrolü).');
    });
  });
});

// =============================================================================
// validateCustomer — Unit Tests
// =============================================================================
describe('validateCustomer', () => {
  const VALID_TC = '10000000146';

  const validIndividualBase = {
    customer_type: 'individual',
    first_name: 'Ali',
    last_name: 'Yılmaz',
    phone: '5551234567',
    email: 'ali@example.com',
    tc_kimlik_no: VALID_TC,
    gender: 'E',
    birth_date: '1990-01-01',
    birth_place: 'Ankara',
  };

  const validCorporateBase = {
    customer_type: 'corporate',
    first_name: 'Ayşe',
    last_name: 'Demir',
    phone: '5559876543',
    email: 'ayse@example.com',
    tax_id_no: '1234567890',
  };

  // ---- Customer type ----
  describe('customer_type', () => {
    it('should reject missing customer_type', () => {
      const { customer_type, ...body } = validIndividualBase;
      const errors = validateCustomer(body);
      expect(errors).toContain('Müşteri tipi "individual" veya "corporate" olmalıdır.');
    });

    it('should reject invalid customer_type', () => {
      const errors = validateCustomer({ ...validIndividualBase, customer_type: 'admin' });
      expect(errors).toContain('Müşteri tipi "individual" veya "corporate" olmalıdır.');
    });

    it('should accept "individual"', () => {
      const errors = validateCustomer(validIndividualBase);
      const typeErrors = errors.filter(e => e.includes('Müşteri tipi'));
      expect(typeErrors).toHaveLength(0);
    });

    it('should accept "corporate"', () => {
      const errors = validateCustomer(validCorporateBase);
      const typeErrors = errors.filter(e => e.includes('Müşteri tipi'));
      expect(typeErrors).toHaveLength(0);
    });
  });

  // ---- first_name ----
  describe('first_name', () => {
    it('should reject missing first_name', () => {
      const { first_name, ...body } = validIndividualBase;
      const errors = validateCustomer(body);
      expect(errors).toContain('Ad zorunludur.');
    });

    it('should reject whitespace-only first_name', () => {
      const errors = validateCustomer({ ...validIndividualBase, first_name: '   ' });
      expect(errors).toContain('Ad zorunludur.');
    });

    it('should accept valid first_name', () => {
      const errors = validateCustomer(validIndividualBase);
      const nameErrors = errors.filter(e => e.includes('Ad'));
      expect(nameErrors).toHaveLength(0);
    });
  });

  // ---- last_name ----
  describe('last_name', () => {
    it('should reject missing last_name', () => {
      const { last_name, ...body } = validIndividualBase;
      const errors = validateCustomer(body);
      expect(errors).toContain('Soyad zorunludur.');
    });

    it('should reject whitespace-only last_name', () => {
      const errors = validateCustomer({ ...validIndividualBase, last_name: '   ' });
      expect(errors).toContain('Soyad zorunludur.');
    });
  });

  // ---- phone ----
  describe('phone', () => {
    it('should reject missing phone', () => {
      const { phone, ...body } = validIndividualBase;
      const errors = validateCustomer(body);
      expect(errors).toContain('Telefon zorunludur.');
    });

    it('should reject whitespace-only phone', () => {
      const errors = validateCustomer({ ...validIndividualBase, phone: '   ' });
      expect(errors).toContain('Telefon zorunludur.');
    });
  });

  // ---- email ----
  describe('email', () => {
    it('should reject missing email', () => {
      const { email, ...body } = validIndividualBase;
      const errors = validateCustomer(body);
      expect(errors).toContain('E-posta zorunludur.');
    });

    it('should reject whitespace-only email', () => {
      const errors = validateCustomer({ ...validIndividualBase, email: '   ' });
      expect(errors).toContain('E-posta zorunludur.');
    });

    it('should reject invalid email format', () => {
      const errors = validateCustomer({ ...validIndividualBase, email: 'not-an-email' });
      expect(errors).toContain('Geçerli bir e-posta adresi giriniz.');
    });

    it('should reject email without @', () => {
      const errors = validateCustomer({ ...validIndividualBase, email: 'ali.example.com' });
      expect(errors).toContain('Geçerli bir e-posta adresi giriniz.');
    });

    it('should reject email without domain', () => {
      const errors = validateCustomer({ ...validIndividualBase, email: 'ali@' });
      expect(errors).toContain('Geçerli bir e-posta adresi giriniz.');
    });

    it('should accept valid email with subdomain', () => {
      const errors = validateCustomer({ ...validIndividualBase, email: 'ali@sub.example.com' });
      expect(errors.filter(e => e.includes('e-posta'))).toHaveLength(0);
    });
  });

  // ---- Individual-specific fields ----
  describe('individual-specific fields', () => {
    describe('tc_kimlik_no', () => {
      it('should reject missing tc_kimlik_no for individual', () => {
        const { tc_kimlik_no, ...body } = validIndividualBase;
        const errors = validateCustomer(body);
        expect(errors).toContain('TC Kimlik No zorunludur.');
      });

      it('should reject invalid tc_kimlik_no for individual', () => {
        const errors = validateCustomer({ ...validIndividualBase, tc_kimlik_no: '123' });
        expect(errors.some(e => e.includes('TC Kimlik No'))).toBe(true);
      });

      it('should not check tc_kimlik_no for corporate', () => {
        const errors = validateCustomer(validCorporateBase);
        const tcErrors = errors.filter(e => e.includes('TC Kimlik No') || e.includes('haneli'));
        expect(tcErrors).toHaveLength(0);
      });
    });

    describe('gender', () => {
      it('should reject missing gender for individual', () => {
        const { gender, ...body } = validIndividualBase;
        const errors = validateCustomer(body);
        expect(errors).toContain('Cinsiyet "E" veya "K" olmalıdır.');
      });

      it('should reject invalid gender', () => {
        const errors = validateCustomer({ ...validIndividualBase, gender: 'X' });
        expect(errors).toContain('Cinsiyet "E" veya "K" olmalıdır.');
      });

      it('should accept gender "E"', () => {
        const errors = validateCustomer({ ...validIndividualBase, gender: 'E' });
        expect(errors.filter(e => e.includes('Cinsiyet'))).toHaveLength(0);
      });

      it('should accept gender "K"', () => {
        const errors = validateCustomer({ ...validIndividualBase, gender: 'K' });
        expect(errors.filter(e => e.includes('Cinsiyet'))).toHaveLength(0);
      });
    });

    describe('birth_date', () => {
      it('should reject missing birth_date for individual', () => {
        const { birth_date, ...body } = validIndividualBase;
        const errors = validateCustomer(body);
        expect(errors).toContain('Doğum tarihi zorunludur.');
      });

      it('should accept when birth_date is provided', () => {
        const errors = validateCustomer(validIndividualBase);
        expect(errors.filter(e => e.includes('Doğum tarihi'))).toHaveLength(0);
      });
    });

    describe('birth_place', () => {
      it('should reject missing birth_place for individual', () => {
        const { birth_place, ...body } = validIndividualBase;
        const errors = validateCustomer(body);
        expect(errors).toContain('Doğum yeri zorunludur.');
      });

      it('should reject whitespace-only birth_place', () => {
        const errors = validateCustomer({ ...validIndividualBase, birth_place: '   ' });
        expect(errors).toContain('Doğum yeri zorunludur.');
      });
    });
  });

  // ---- Corporate-specific fields ----
  describe('corporate-specific fields', () => {
    it('should reject missing tax_id_no for corporate', () => {
      const { tax_id_no, ...body } = validCorporateBase;
      const errors = validateCustomer(body);
      expect(errors).toContain('Vergi Kimlik No zorunludur.');
    });

    it('should reject whitespace-only tax_id_no for corporate', () => {
      const errors = validateCustomer({ ...validCorporateBase, tax_id_no: '   ' });
      expect(errors).toContain('Vergi Kimlik No zorunludur.');
    });

    it('should not check tax_id_no for individual', () => {
      const errors = validateCustomer(validIndividualBase);
      const taxErrors = errors.filter(e => e.includes('Vergi'));
      expect(taxErrors).toHaveLength(0);
    });
  });

  // ---- Complete scenario ----
  describe('full validation', () => {
    it('should return no errors for a fully valid individual customer', () => {
      const errors = validateCustomer(validIndividualBase);
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for a fully valid corporate customer', () => {
      const errors = validateCustomer(validCorporateBase);
      expect(errors).toHaveLength(0);
    });

    it('should return multiple errors for a completely empty body', () => {
      const errors = validateCustomer({});
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});

// =============================================================================
// validateAccount — Unit Tests
// =============================================================================
describe('validateAccount', () => {
  const validAccount = {
    account_name: 'TL Hesap',
    currency_code: 'TRY',
    balance: 1000,
  };

  describe('account_name', () => {
    it('should reject missing account_name', () => {
      const { account_name, ...body } = validAccount;
      const errors = validateAccount(body);
      expect(errors).toContain('Hesap adı zorunludur.');
    });

    it('should reject whitespace-only account_name', () => {
      const errors = validateAccount({ ...validAccount, account_name: '   ' });
      expect(errors).toContain('Hesap adı zorunludur.');
    });

    it('should accept valid account_name', () => {
      const errors = validateAccount(validAccount);
      expect(errors.filter(e => e.includes('Hesap adı'))).toHaveLength(0);
    });
  });

  describe('currency_code', () => {
    it('should reject missing currency_code', () => {
      const { currency_code, ...body } = validAccount;
      const errors = validateAccount(body);
      expect(errors).toContain('Döviz kodu zorunludur.');
    });

    it('should accept when currency_code is provided', () => {
      const errors = validateAccount(validAccount);
      expect(errors.filter(e => e.includes('Döviz kodu'))).toHaveLength(0);
    });
  });

  describe('iban', () => {
    it('should not require iban (optional field)', () => {
      const errors = validateAccount(validAccount);
      expect(errors.filter(e => e.includes('IBAN'))).toHaveLength(0);
    });

    it('should accept valid IBAN when provided', () => {
      const errors = validateAccount({ ...validAccount, iban: 'TR330006100519786457841326' });
      expect(errors.filter(e => e.includes('IBAN'))).toHaveLength(0);
    });

    it('should reject invalid IBAN when provided', () => {
      // TR3300 is only 6 chars — fails the "26 karakter" check for Turkish IBANs
      const errors = validateAccount({ ...validAccount, iban: 'TR3300' });
      expect(errors.some(e => e.includes('IBAN'))).toBe(true);
    });
  });

  describe('balance', () => {
    it('should not require balance (optional field)', () => {
      const { balance, ...body } = validAccount;
      const errors = validateAccount(body);
      expect(errors).toHaveLength(0);
    });

    it('should accept numeric balance', () => {
      const errors = validateAccount({ ...validAccount, balance: 1500.50 });
      expect(errors.filter(e => e.includes('Bakiye'))).toHaveLength(0);
    });

    it('should accept balance as string number', () => {
      const errors = validateAccount({ ...validAccount, balance: '2000' });
      expect(errors.filter(e => e.includes('Bakiye'))).toHaveLength(0);
    });

    it('should reject non-numeric balance', () => {
      const errors = validateAccount({ ...validAccount, balance: 'abc' });
      expect(errors).toContain('Bakiye geçerli bir sayı olmalıdır.');
    });

    it('should accept 0 as balance', () => {
      const errors = validateAccount({ ...validAccount, balance: 0 });
      // parseFloat('0') → 0, isNaN(0) → false, so no error
      expect(errors.filter(e => e.includes('Bakiye'))).toHaveLength(0);
    });

    it('should reject NaN balance', () => {
      const errors = validateAccount({ ...validAccount, balance: NaN });
      expect(errors).toContain('Bakiye geçerli bir sayı olmalıdır.');
    });
  });

  describe('full validation', () => {
    it('should return no errors for a fully valid account', () => {
      const errors = validateAccount(validAccount);
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for minimal valid account (only name and currency)', () => {
      const errors = validateAccount({ account_name: 'USD Hesap', currency_code: 'USD' });
      expect(errors).toHaveLength(0);
    });
  });
});

// =============================================================================
// validateWorkplace — Unit Tests
// =============================================================================
describe('validateWorkplace', () => {
  const validWorkplace = {
    name: 'Merkez Şube',
    manager: 'Mehmet Demir',
    workplace_type: 'normal',
  };

  describe('name', () => {
    it('should reject missing name', () => {
      const { name, ...body } = validWorkplace;
      const errors = validateWorkplace(body);
      expect(errors).toContain('İşyeri adı zorunludur.');
    });

    it('should reject whitespace-only name', () => {
      const errors = validateWorkplace({ ...validWorkplace, name: '   ' });
      expect(errors).toContain('İşyeri adı zorunludur.');
    });

    it('should accept valid name', () => {
      const errors = validateWorkplace(validWorkplace);
      expect(errors.filter(e => e.includes('İşyeri adı'))).toHaveLength(0);
    });
  });

  describe('manager', () => {
    it('should reject missing manager', () => {
      const { manager, ...body } = validWorkplace;
      const errors = validateWorkplace(body);
      expect(errors).toContain('Yönetici zorunludur.');
    });

    it('should reject whitespace-only manager', () => {
      const errors = validateWorkplace({ ...validWorkplace, manager: '   ' });
      expect(errors).toContain('Yönetici zorunludur.');
    });
  });

  describe('workplace_type', () => {
    it('should reject missing workplace_type', () => {
      const { workplace_type, ...body } = validWorkplace;
      const errors = validateWorkplace(body);
      expect(errors).toContain('İşyeri tipi "normal" veya "virtual" olmalıdır.');
    });

    it('should reject invalid workplace_type', () => {
      const errors = validateWorkplace({ ...validWorkplace, workplace_type: 'remote' });
      expect(errors).toContain('İşyeri tipi "normal" veya "virtual" olmalıdır.');
    });

    it('should accept "normal"', () => {
      const errors = validateWorkplace({ ...validWorkplace, workplace_type: 'normal' });
      expect(errors.filter(e => e.includes('İşyeri tipi'))).toHaveLength(0);
    });

    it('should accept "virtual"', () => {
      const errors = validateWorkplace({ ...validWorkplace, workplace_type: 'virtual' });
      expect(errors.filter(e => e.includes('İşyeri tipi'))).toHaveLength(0);
    });
  });

  describe('full validation', () => {
    it('should return no errors for a fully valid workplace', () => {
      const errors = validateWorkplace(validWorkplace);
      expect(errors).toHaveLength(0);
    });

    it('should return multiple errors for empty body', () => {
      const errors = validateWorkplace({});
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});

// =============================================================================
// validateTerminal — Unit Tests
// =============================================================================
describe('validateTerminal', () => {
  const validTerminal = {
    serial_no: 'SN-2026-001',
    model_code: 'M1000',
    registration_status: 1,
  };

  describe('serial_no', () => {
    it('should reject missing serial_no', () => {
      const { serial_no, ...body } = validTerminal;
      const errors = validateTerminal(body);
      expect(errors).toContain('Seri no zorunludur.');
    });

    it('should reject whitespace-only serial_no', () => {
      const errors = validateTerminal({ ...validTerminal, serial_no: '   ' });
      expect(errors).toContain('Seri no zorunludur.');
    });

    it('should accept valid serial_no', () => {
      const errors = validateTerminal(validTerminal);
      expect(errors.filter(e => e.includes('Seri no'))).toHaveLength(0);
    });
  });

  describe('model_code', () => {
    it('should reject missing model_code', () => {
      const { model_code, ...body } = validTerminal;
      const errors = validateTerminal(body);
      expect(errors).toContain('Model kodu zorunludur.');
    });

    it('should reject whitespace-only model_code', () => {
      const errors = validateTerminal({ ...validTerminal, model_code: '   ' });
      expect(errors).toContain('Model kodu zorunludur.');
    });
  });

  describe('registration_status', () => {
    it('should reject status not in [0,1,2]', () => {
      const errors = validateTerminal({ ...validTerminal, registration_status: 3 });
      expect(errors).toContain('Kayıt durumu 0, 1 veya 2 olmalıdır.');
    });

    it('should reject negative status', () => {
      const errors = validateTerminal({ ...validTerminal, registration_status: -1 });
      expect(errors).toContain('Kayıt durumu 0, 1 veya 2 olmalıdır.');
    });

    it('should accept status 0', () => {
      const errors = validateTerminal({ ...validTerminal, registration_status: 0 });
      expect(errors.filter(e => e.includes('Kayıt durumu 0'))).toHaveLength(0);
    });

    it('should accept status 1', () => {
      const errors = validateTerminal({ ...validTerminal, registration_status: 1 });
      expect(errors.filter(e => e.includes('Kayıt durumu 0'))).toHaveLength(0);
    });

    it('should accept status 2', () => {
      const errors = validateTerminal({ ...validTerminal, registration_status: 2 });
      expect(errors.filter(e => e.includes('Kayıt durumu 0'))).toHaveLength(0);
    });
  });

  describe('closure_reason (on update, status = 0)', () => {
    it('should require closure_reason when isUpdate=true and status is 0', () => {
      const errors = validateTerminal(
        { ...validTerminal, registration_status: 0, closure_reason: '   ' },
        true,
      );
      expect(errors).toContain('Kayıt durumu "Kapalı" seçildiğinde kapanma nedeni zorunludur.');
    });

    it('should require closure_reason when isUpdate=true, status is 0, and reason missing', () => {
      const errors = validateTerminal(
        { serial_no: 'X', model_code: 'Y', registration_status: 0 },
        true,
      );
      expect(errors).toContain('Kayıt durumu "Kapalı" seçildiğinde kapanma nedeni zorunludur.');
    });

    it('should NOT require closure_reason when isUpdate=false even if status is 0', () => {
      const errors = validateTerminal(
        { ...validTerminal, registration_status: 0 },
        false,
      );
      expect(errors.filter(e => e.includes('kapanma nedeni'))).toHaveLength(0);
    });

    it('should NOT require closure_reason when isUpdate=true but status is not 0', () => {
      const errors = validateTerminal(validTerminal, true);
      expect(errors.filter(e => e.includes('kapanma nedeni'))).toHaveLength(0);
    });

    it('should accept valid closure_reason on update with status 0', () => {
      const errors = validateTerminal(
        { ...validTerminal, registration_status: 0, closure_reason: 'Cihaz arızalı' },
        true,
      );
      expect(errors.filter(e => e.includes('kapanma nedeni'))).toHaveLength(0);
    });
  });

  describe('full validation', () => {
    it('should return no errors for a fully valid terminal (create)', () => {
      const errors = validateTerminal(validTerminal);
      expect(errors).toHaveLength(0);
    });

    it('should return no errors for a fully valid terminal (update, status=1)', () => {
      const errors = validateTerminal(validTerminal, true);
      expect(errors).toHaveLength(0);
    });

    it('should return multiple errors for empty body', () => {
      const errors = validateTerminal({});
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});
