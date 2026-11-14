import { signInWithPopup } from 'firebase/auth';
import { loginWithGoogle } from './authService';

jest.mock('./firebase', () => ({ auth: { name: 'auth-instance' } }));

describe('loginWithGoogle', () => {
  it.each(['falha inesperada', null])(
    'rethrows a failure without an error code (%p)',
    async (failure) => {
      jest.mocked(signInWithPopup).mockRejectedValue(failure);

      await expect(loginWithGoogle()).rejects.toBe(failure);
    },
  );
});
