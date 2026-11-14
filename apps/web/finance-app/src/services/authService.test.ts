import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { loginWithGoogle, logout, subscribeToAuthChanges } from './authService';

jest.mock('./firebase', () => ({ auth: { name: 'auth-instance' } }));
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

const firebaseUser = {
  uid: 'u1',
  displayName: 'Ana',
  email: 'ana@example.com',
  photoURL: null,
  refreshToken: 'secret',
};
const authUser = { uid: 'u1', displayName: 'Ana', email: 'ana@example.com', photoURL: null };

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes the signed-in user without Firebase internals', () => {
    const unsubscribe = jest.fn();
    jest.mocked(onAuthStateChanged).mockImplementation((_auth, next) => {
      (next as (user: unknown) => void)(firebaseUser);
      return unsubscribe;
    });
    const onChange = jest.fn();

    const result = subscribeToAuthChanges(onChange);

    expect(onChange).toHaveBeenCalledWith(authUser);
    expect(result).toBe(unsubscribe);
  });

  it('publishes null when signed out', () => {
    jest.mocked(onAuthStateChanged).mockImplementation((_auth, next) => {
      (next as (user: unknown) => void)(null);
      return jest.fn();
    });
    const onChange = jest.fn();

    subscribeToAuthChanges(onChange);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('signs in with a Google popup', async () => {
    jest.mocked(signInWithPopup).mockResolvedValue({ user: firebaseUser } as never);

    await expect(loginWithGoogle()).resolves.toEqual(authUser);
    expect(signInWithPopup).toHaveBeenCalledWith(
      { name: 'auth-instance' },
      jest.mocked(GoogleAuthProvider).mock.instances[0],
    );
  });

  it.each(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])(
    'returns null when the popup is dismissed (%s)',
    async (code) => {
      jest.mocked(signInWithPopup).mockRejectedValue({ code });

      await expect(loginWithGoogle()).resolves.toBeNull();
    },
  );

  it('rethrows other sign-in failures', async () => {
    const failure = { code: 'auth/network-request-failed' };
    jest.mocked(signInWithPopup).mockRejectedValue(failure);

    await expect(loginWithGoogle()).rejects.toBe(failure);
  });

  it('signs out', async () => {
    jest.mocked(signOut).mockResolvedValue();

    await logout();

    expect(signOut).toHaveBeenCalledWith({ name: 'auth-instance' });
  });
});
