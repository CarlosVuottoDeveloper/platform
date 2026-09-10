import { emailFormatError, passwordMinLengthError } from './validation';

describe('emailFormatError', () => {
  it('returns undefined for an empty email (no error until the user types something)', () => {
    expect(emailFormatError('')).toBeUndefined();
  });

  it('returns undefined for a valid email', () => {
    expect(emailFormatError('user@example.com')).toBeUndefined();
  });

  it('returns an error for an email missing the @', () => {
    expect(emailFormatError('userexample.com')).toBe('Formato de e-mail inválido');
  });

  it('returns an error for an email missing the domain', () => {
    expect(emailFormatError('user@')).toBe('Formato de e-mail inválido');
  });

  it('returns an error for an email missing the top-level domain', () => {
    expect(emailFormatError('user@example')).toBe('Formato de e-mail inválido');
  });

  it('returns an error for an email with spaces', () => {
    expect(emailFormatError('user name@example.com')).toBe('Formato de e-mail inválido');
  });
});

describe('passwordMinLengthError', () => {
  it('returns undefined for an empty password (no error until the user types something)', () => {
    expect(passwordMinLengthError('')).toBeUndefined();
  });

  it('returns undefined for a password with exactly 8 characters', () => {
    expect(passwordMinLengthError('abcd1234')).toBeUndefined();
  });

  it('returns undefined for a password longer than 8 characters', () => {
    expect(passwordMinLengthError('secret1234')).toBeUndefined();
  });

  it('returns an error for a password with 7 characters', () => {
    expect(passwordMinLengthError('abc1234')).toBe('Mínimo de 8 caracteres');
  });
});
