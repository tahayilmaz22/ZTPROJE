/**
 * IBAN Validator
 *
 * Standard IBAN validation:
 * 1. Remove spaces, convert to uppercase
 * 2. Move first 4 characters to the end
 * 3. Replace letters with numbers (A=10, B=11, ..., Z=35)
 * 4. Check mod 97 === 1
 *
 * Turkish IBAN format: TR + 24 digits = 26 characters total
 */

function validateIBAN(iban) {
  if (!iban) {
    return { valid: false, message: 'IBAN zorunludur.' };
  }

  // Remove spaces and convert to uppercase
  const cleaned = iban.replace(/\s+/g, '').toUpperCase();

  // Basic length check
  if (cleaned.length < 5 || cleaned.length > 34) {
    return { valid: false, message: 'IBAN uzunluğu geçersiz.' };
  }

  // Check Turkish IBAN format: TR + 24 digits
  if (cleaned.startsWith('TR')) {
    if (cleaned.length !== 26) {
      return { valid: false, message: 'Türkiye IBAN numarası 26 karakter olmalıdır (TR + 24 hane).' };
    }
    if (!/^TR\d{24}$/.test(cleaned)) {
      return { valid: false, message: 'Türkiye IBAN formatı: TR + 24 rakam.' };
    }
  }

  // General IBAN validation (mod 97 check)
  // Move first 4 chars to end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);

  // Replace letters with numbers
  let numericString = '';
  for (const char of rearranged) {
    if (char >= 'A' && char <= 'Z') {
      numericString += (char.charCodeAt(0) - 55).toString();
    } else {
      numericString += char;
    }
  }

  // Perform mod 97 on large number (in chunks to avoid overflow)
  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 9) {
    const chunk = remainder.toString() + numericString.slice(i, i + 9);
    remainder = parseInt(chunk, 10) % 97;
  }

  if (remainder !== 1) {
    return { valid: false, message: 'IBAN doğrulama başarısız (mod 97 kontrolü).' };
  }

  return { valid: true, message: 'Geçerli IBAN.' };
}

module.exports = { validateIBAN };
