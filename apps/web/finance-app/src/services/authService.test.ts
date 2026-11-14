import {
  GoogleAuthProvider,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  confirmRecentLogin,
  deleteCurrentUser,
  loginWithGoogle,
  logout,
  subscribeToAuthChanges,
} from './authService';
import { reloadPage } from './browser';
import { clearLocalCache } from './localCache';

const mockAuth: { name: string; currentUser: unknown } = {
  name: 'auth-instance',
  currentUser: null,
};
jest.mock('./firebase', () => ({
  get auth() {
    return mockAuth;
  },
}));
jest.mock('./browser');
jest.mock('./localCache');
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

  it('signs out, wipes the data cached on this device and starts fresh', async () => {
    const order: string[] = [];
    jest.mocked(signOut).mockImplementation(async () => {
      order.push('signOut');
    });
    jest.mocked(clearLocalCache).mockImplementation(async () => {
      order.push('clearLocalCache');
    });
    jest.mocked(reloadPage).mockImplementation(() => {
      order.push('reloadPage');
    });

    await logout();

    expect(signOut).toHaveBeenCalledWith(mockAuth);
    expect(order).toEqual(['signOut', 'clearLocalCache', 'reloadPage']);
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

  describe('confirming a recent login', () => {
    afterEach(() => {
      mockAuth.currentUser = null;
      jest.useRealTimers();
    });

    it('asks nothing when the user signed in moments ago', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-03-15T12:03:00Z'));
      mockAuth.currentUser = {
        ...firebaseUser,
        metadata: { lastSignInTime: 'Sun, 15 Mar 2026 12:00:00 GMT' },
      };

      await confirmRecentLogin();

      expect(reauthenticateWithPopup).not.toHaveBeenCalled();
    });

    it('asks Google to confirm the identity when the session is older', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-03-15T13:00:00Z'));
      mockAuth.currentUser = {
        ...firebaseUser,
        metadata: { lastSignInTime: 'Sun, 15 Mar 2026 12:00:00 GMT' },
      };
      jest.mocked(reauthenticateWithPopup).mockResolvedValue({} as never);

      await confirmRecentLogin();

      expect(reauthenticateWithPopup).toHaveBeenCalledWith(
        mockAuth.currentUser,
        jest.mocked(GoogleAuthProvider).mock.instances[0],
      );
    });

    it('asks too when the sign-in time is unknown, and fails when the user refuses', async () => {
      mockAuth.currentUser = { ...firebaseUser, metadata: {} };
      const refused = { code: 'auth/popup-closed-by-user' };
      jest.mocked(reauthenticateWithPopup).mockRejectedValue(refused);

      await expect(confirmRecentLogin()).rejects.toBe(refused);
    });

    it('does nothing when nobody is signed in', async () => {
      await confirmRecentLogin();

      expect(reauthenticateWithPopup).not.toHaveBeenCalled();
    });
  });

  it('wipes the local cache and starts fresh after the account is deleted', async () => {
    mockAuth.currentUser = firebaseUser;
    jest.mocked(deleteUser).mockResolvedValue();

    await deleteCurrentUser();

    expect(clearLocalCache).toHaveBeenCalledTimes(1);
    expect(reloadPage).toHaveBeenCalledTimes(1);
    mockAuth.currentUser = null;
  });
});
