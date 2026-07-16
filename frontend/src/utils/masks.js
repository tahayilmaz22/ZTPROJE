/**
 * Apply TC Kimlik No mask: ___ ___ ___ __
 */
export function maskTCKimlik(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  let masked = '';
  for (let i = 0; i < 11; i++) {
    if (i === 3 || i === 6 || i === 9) masked += ' ';
    masked += digits[i] || '_';
  }
  return masked;
}

export function unmaskTCKimlik(masked) {
  return masked.replace(/\D/g, '');
}

/**
 * Apply phone mask: (5__) ___ __ __
 */
export function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  let masked = '(';
  for (let i = 0; i < 10; i++) {
    if (i === 3) masked += ') ';
    if (i === 6 || i === 8) masked += ' ';
    masked += digits[i] || '_';
  }
  return masked;
}

export function unmaskPhone(masked) {
  return masked.replace(/\D/g, '');
}
