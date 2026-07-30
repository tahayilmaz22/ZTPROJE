import { maskTCKimlik, unmaskTCKimlik, maskPhone, unmaskPhone } from './masks';

// =============================================================================
// maskTCKimlik — Unit Tests
// =============================================================================
describe('maskTCKimlik', () => {
  describe('valid inputs', () => {
    it('should mask a full 11-digit TC number', () => {
      const result = maskTCKimlik('12345678901');
      expect(result).toBe('123 456 789 01');
    });

    it('should mask another valid TC number', () => {
      const result = maskTCKimlik('10000000146');
      expect(result).toBe('100 000 001 46');
    });

    it('should handle input already containing spaces', () => {
      const result = maskTCKimlik('123 456 789 01');
      expect(result).toBe('123 456 789 01');
    });

    it('should handle input with non-digit characters', () => {
      const result = maskTCKimlik('123-456.789/01');
      expect(result).toBe('123 456 789 01');
    });
  });

  describe('partial inputs', () => {
    it('should mask partial input (3 digits)', () => {
      const result = maskTCKimlik('123');
      expect(result).toBe('123 ___ ___ __');
    });

    it('should mask partial input (6 digits)', () => {
      const result = maskTCKimlik('123456');
      expect(result).toBe('123 456 ___ __');
    });

    it('should mask partial input (9 digits)', () => {
      const result = maskTCKimlik('123456789');
      expect(result).toBe('123 456 789 __');
    });
  });

  describe('empty / edge cases', () => {
    it('should return all underscores for empty string', () => {
      const result = maskTCKimlik('');
      expect(result).toBe('___ ___ ___ __');
    });

    it('should return all underscores for input with no digits', () => {
      const result = maskTCKimlik('abc-./');
      expect(result).toBe('___ ___ ___ __');
    });

    it('should truncate input longer than 11 digits', () => {
      const result = maskTCKimlik('12345678901234');
      expect(result).toBe('123 456 789 01');
    });
  });
});

// =============================================================================
// unmaskTCKimlik — Unit Tests
// =============================================================================
describe('unmaskTCKimlik', () => {
  describe('valid inputs', () => {
    it('should remove spaces from masked TC', () => {
      const result = unmaskTCKimlik('123 456 789 01');
      expect(result).toBe('12345678901');
    });

    it('should remove all non-digit characters', () => {
      const result = unmaskTCKimlik('123-456.789/01');
      expect(result).toBe('12345678901');
    });

    it('should return unchanged for already-unmasked digits', () => {
      const result = unmaskTCKimlik('12345678901');
      expect(result).toBe('12345678901');
    });
  });

  describe('empty / edge cases', () => {
    it('should return empty string for empty input', () => {
      const result = unmaskTCKimlik('');
      expect(result).toBe('');
    });

    it('should return empty string for input with only non-digits', () => {
      const result = unmaskTCKimlik('___ ___ ___ __');
      expect(result).toBe('');
    });
  });
});

// =============================================================================
// maskPhone — Unit Tests
// =============================================================================
describe('maskPhone', () => {
  describe('valid inputs', () => {
    it('should mask a full 10-digit phone number', () => {
      const result = maskPhone('5551234567');
      expect(result).toBe('(555) 123 45 67');
    });

    it('should mask another valid phone number', () => {
      const result = maskPhone('5329876543');
      expect(result).toBe('(532) 987 65 43');
    });

    it('should handle input already containing mask characters', () => {
      const result = maskPhone('(555) 123 45 67');
      expect(result).toBe('(555) 123 45 67');
    });

    it('should handle input with non-digit characters', () => {
      const result = maskPhone('555-123.45/67');
      expect(result).toBe('(555) 123 45 67');
    });
  });

  describe('partial inputs', () => {
    it('should mask partial input (3 digits)', () => {
      const result = maskPhone('555');
      expect(result).toBe('(555) ___ __ __');
    });

    it('should mask partial input (6 digits)', () => {
      const result = maskPhone('555123');
      expect(result).toBe('(555) 123 __ __');
    });

    it('should mask partial input (8 digits)', () => {
      const result = maskPhone('55512345');
      expect(result).toBe('(555) 123 45 __');
    });
  });

  describe('empty / edge cases', () => {
    it('should return all underscores for empty string', () => {
      const result = maskPhone('');
      expect(result).toBe('(___) ___ __ __');
    });

    it('should return all underscores for input with no digits', () => {
      const result = maskPhone('abc-./');
      expect(result).toBe('(___) ___ __ __');
    });

    it('should truncate input longer than 10 digits', () => {
      const result = maskPhone('555123456789');
      expect(result).toBe('(555) 123 45 67');
    });
  });
});

// =============================================================================
// unmaskPhone — Unit Tests
// =============================================================================
describe('unmaskPhone', () => {
  describe('valid inputs', () => {
    it('should remove mask characters from formatted phone', () => {
      const result = unmaskPhone('(555) 123 45 67');
      expect(result).toBe('5551234567');
    });

    it('should remove all non-digit characters', () => {
      const result = unmaskPhone('555-123.45/67');
      expect(result).toBe('5551234567');
    });

    it('should return unchanged for already-unmasked digits', () => {
      const result = unmaskPhone('5551234567');
      expect(result).toBe('5551234567');
    });
  });

  describe('empty / edge cases', () => {
    it('should return empty string for empty input', () => {
      const result = unmaskPhone('');
      expect(result).toBe('');
    });

    it('should return empty string for input with only mask characters', () => {
      const result = unmaskPhone('(___) ___ __ __');
      expect(result).toBe('');
    });
  });
});
