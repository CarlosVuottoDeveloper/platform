import { describe, it, expect } from '@jest/globals';
import { passwordMinLengthError } from './validation';

describe('passwordMinLengthError', () => {
  it('returns undefined for an empty password', () => {
    expect(passwordMinLengthError('')).toBeUndefined();
  });

  it('returns undefined for a password with 8 or more characters', () => {
    expect(passwordMinLengthError('12345678')).toBeUndefined();
  });

  it('returns an error message for a non-empty password shorter than 8 characters', () => {
    expect(passwordMinLengthError('abc1234')).toBe('Mínimo de 8 caracteres');
  });
});
