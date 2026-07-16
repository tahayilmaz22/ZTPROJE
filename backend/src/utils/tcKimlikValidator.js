/**
 * Turkish TC Kimlik No (Turkish Identification Number) Validator
 *
 * Algorithm (standard T.C. Kimlik No validation):
 * 1. Must be exactly 11 digits
 * 2. First digit cannot be 0
 * 3. The 10th digit is calculated as:
 *    (sum of odd-positioned digits (1,3,5,7,9) × 7 − sum of even-positioned digits (2,4,6,8)) mod 10
 * 4. The 11th digit is calculated as:
 *    sum of first 10 digits mod 10
 */

function validateTCKimlikNo(tcNo) {
  // Must be exactly 11 characters
  if (!tcNo || tcNo.length !== 11) {
    return { valid: false, message: 'TC Kimlik No 11 haneli olmalıdır.' };
  }

  // Must be all digits
  if (!/^\d{11}$/.test(tcNo)) {
    return { valid: false, message: 'TC Kimlik No sadece rakamlardan oluşmalıdır.' };
  }

  // First digit cannot be 0
  if (tcNo[0] === '0') {
    return { valid: false, message: 'TC Kimlik No ilk hanesi 0 olamaz.' };
  }

  const digits = tcNo.split('').map(Number);

  // Sum of first 10 digits mod 10 must equal the 11th digit
  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sumFirst10 % 10 !== digits[10]) {
    return { valid: false, message: 'Geçersiz TC Kimlik No: 11. hane kontrolü başarısız.' };
  }

  // (sum of odd-positioned digits × 7 − sum of even-positioned digits) mod 10 = digit 10
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenthDigitCalc = ((oddSum * 7) - evenSum) % 10;

  // Handle negative modulo in JS
  const tenthDigit = tenthDigitCalc < 0 ? tenthDigitCalc + 10 : tenthDigitCalc;

  if (tenthDigit !== digits[9]) {
    return { valid: false, message: 'Geçersiz TC Kimlik No: 10. hane kontrolü başarısız.' };
  }

  return { valid: true, message: 'Geçerli TC Kimlik No.' };
}

module.exports = { validateTCKimlikNo };
