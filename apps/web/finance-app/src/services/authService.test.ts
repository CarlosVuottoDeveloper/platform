import {
  GoogleAuthProvider,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { deleteCurrentUser, loginWithGoogle, logout, subscribeToAuthChanges } from './authService';

const mockAuth: { name: string; currentUser: unknown } = {
  name: 'auth-instance',
  currentUser: null,
};
jest.mock('./firebase', () => ({
  get auth() {
    return mockAuth;
  },
}));
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  deleteUser: jest.fn(),
  reauthenticateWithPopup: jest.fn(),
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
      mockAuth,
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

    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  describe('deleting the account', () => {
    beforeEach(() => {
      mockAuth.currentUser = firebaseUser;
    });

    afterEach(() => {
      mockAuth.currentUser = null;
    });

    it('deletes the signed-in user', async () => {
      jest.mocked(deleteUser).mockResolvedValue();

      await deleteCurrentUser();

      expect(deleteUser).toHaveBeenCalledWith(firebaseUser);
      expect(reauthenticateWithPopup).not.toHaveBeenCalled();
    });

    it('asks Google to confirm the identity again when the session is old, then deletes', async () => {
      jest
        .mocked(deleteUser)
        .mockRejectedValueOnce({ code: 'auth/requires-recent-login' })
        .mockResolvedValueOnce();
      jest.mocked(reauthenticateWithPopup).mockResolvedValue({} as never);

      await deleteCurrentUser();

      expect(reauthenticateWithPopup).toHaveBeenCalledWith(
        firebaseUser,
        jest.mocked(GoogleAuthProvider).mock.instances[0],
      );
      expect(deleteUser).toHaveBeenCalledTimes(2);
    });

    it('rethrows other failures', async () => {
      const failure = { code: 'auth/network-request-failed' };
      jest.mocked(deleteUser).mockRejectedValue(failure);

      await expect(deleteCurrentUser()).rejects.toBe(failure);
    });

    it('does nothing when nobody is signed in', async () => {
      mockAuth.currentUser = null;

      await deleteCurrentUser();

      expect(deleteUser).not.toHaveBeenCalled();
    });
  });
});
