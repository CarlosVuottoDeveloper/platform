import { errorCode } from './errorCode';

describe('errorCode', () => {
  it('extracts the code of a Firebase error', () => {
    expect(errorCode({ code: 'permission-denied', message: 'private details' })).toBe(
      'permission-denied',
    );
  });

  it('falls back to unknown for anything else', () => {
    expect(errorCode(new Error('boom'))).toBe('unknown');
    expect(errorCode(null)).toBe('unknown');
    expect(errorCode('text')).toBe('unknown');
  });
});
