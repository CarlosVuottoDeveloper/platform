import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  login,
  loginWithGoogle,
  logout,
  register,
  sendPasswordReset,
  subscribeToAuthChanges,
} from './authService';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: { credential: jest.fn() },
  signInWithCredential: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('../firebase', () => ({
  auth: { currentUser: null },
}));

const mockedSignIn = signInWithEmailAndPassword as jest.Mock;
const mockedCreateUser = createUserWithEmailAndPassword as jest.Mock;
const mockedUpdateProfile = updateProfile as jest.Mock;
const mockedSendPasswordResetEmail = sendPasswordResetEmail as jest.Mock;
const mockedOnAuthStateChanged = onAuthStateChanged as jest.Mock;
const mockedSignOut = signOut as jest.Mock;
const mockedSignInWithCredential = signInWithCredential as jest.Mock;
const mockedGoogleCredential = GoogleAuthProvider.credential as jest.Mock;

describe('authService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('calls signInWithEmailAndPassword with the given credentials', async () => {
      mockedSignIn.mockResolvedValue({ user: { uid: 'abc123', email: 'user@example.com' } });

      await login('user@example.com', 'secret123');

      expect(mockedSignIn).toHaveBeenCalledWith(expect.anything(), 'user@example.com', 'secret123');
    });

    it('returns the authenticated user uid and email', async () => {
      mockedSignIn.mockResolvedValue({ user: { uid: 'abc123', email: 'user@example.com' } });

      const result = await login('user@example.com', 'secret123');

      expect(result).toEqual({ uid: 'abc123', email: 'user@example.com' });
    });

    it('falls back to the provided email when the firebase user has no email', async () => {
      mockedSignIn.mockResolvedValue({ user: { uid: 'abc123', email: null } });

      const result = await login('user@example.com', 'secret123');

      expect(result.email).toBe('user@example.com');
    });

    it('propagates errors thrown by signInWithEmailAndPassword', async () => {
      const error = new Error('auth/wrong-password');
      mockedSignIn.mockRejectedValue(error);

      await expect(login('user@example.com', 'wrong')).rejects.toThrow(error);
    });
  });

  describe('register', () => {
    it('calls createUserWithEmailAndPassword with the given credentials', async () => {
      const fakeUser = { uid: 'abc123', email: 'user@example.com' };
      mockedCreateUser.mockResolvedValue({ user: fakeUser });
      mockedUpdateProfile.mockResolvedValue(undefined);

      await register('Ada Lovelace', 'user@example.com', 'secret123');

      expect(mockedCreateUser).toHaveBeenCalledWith(
        expect.anything(),
        'user@example.com',
        'secret123',
      );
    });

    it('sets the display name on the created user, trimmed', async () => {
      const fakeUser = { uid: 'abc123', email: 'user@example.com' };
      mockedCreateUser.mockResolvedValue({ user: fakeUser });
      mockedUpdateProfile.mockResolvedValue(undefined);

      await register('  Ada Lovelace  ', 'user@example.com', 'secret123');

      expect(mockedUpdateProfile).toHaveBeenCalledWith(fakeUser, { displayName: 'Ada Lovelace' });
    });

    it('returns the authenticated user uid and email', async () => {
      mockedCreateUser.mockResolvedValue({ user: { uid: 'abc123', email: 'user@example.com' } });
      mockedUpdateProfile.mockResolvedValue(undefined);

      const result = await register('Ada Lovelace', 'user@example.com', 'secret123');

      expect(result).toEqual({ uid: 'abc123', email: 'user@example.com' });
    });

    it('falls back to the provided email when the firebase user has no email', async () => {
      mockedCreateUser.mockResolvedValue({ user: { uid: 'abc123', email: null } });
      mockedUpdateProfile.mockResolvedValue(undefined);

      const result = await register('Ada Lovelace', 'user@example.com', 'secret123');

      expect(result.email).toBe('user@example.com');
    });

    it('propagates errors thrown by createUserWithEmailAndPassword', async () => {
      const error = new Error('auth/email-already-in-use');
      mockedCreateUser.mockRejectedValue(error);

      await expect(register('Ada Lovelace', 'user@example.com', 'secret123')).rejects.toThrow(
        error,
      );
      expect(mockedUpdateProfile).not.toHaveBeenCalled();
    });
  });

  describe('loginWithGoogle', () => {
    it('signs in to Firebase with the credential built from the Google idToken', async () => {
      mockedGoogleCredential.mockReturnValue('google-credential');
      mockedSignInWithCredential.mockResolvedValue({
        user: { uid: 'abc123', email: 'user@example.com' },
      });

      await loginWithGoogle();

      expect(mockedGoogleCredential).toHaveBeenCalledWith('mockIdToken');
      expect(mockedSignInWithCredential).toHaveBeenCalledWith(
        expect.anything(),
        'google-credential',
      );
    });

    it('returns the authenticated user uid and email', async () => {
      mockedSignInWithCredential.mockResolvedValue({
        user: { uid: 'abc123', email: 'user@example.com' },
      });

      const result = await loginWithGoogle();

      expect(result).toEqual({ uid: 'abc123', email: 'user@example.com' });
    });

    it('falls back to the Google account email when the firebase user has no email', async () => {
      mockedSignInWithCredential.mockResolvedValue({ user: { uid: 'abc123', email: null } });

      const result = await loginWithGoogle();

      expect(result?.email).toBe('mockEmail');
    });

    it('returns null without touching Firebase when the user cancels the Google prompt', async () => {
      jest.spyOn(GoogleSignin, 'signIn').mockResolvedValueOnce({ type: 'cancelled', data: null });

      const result = await loginWithGoogle();

      expect(result).toBeNull();
      expect(mockedSignInWithCredential).not.toHaveBeenCalled();
    });

    it('throws when Google returns no idToken', async () => {
      jest.spyOn(GoogleSignin, 'signIn').mockResolvedValueOnce({
        type: 'success',
        data: {
          idToken: null,
          serverAuthCode: null,
          scopes: [],
          user: {
            id: 'mockId',
            name: null,
            email: 'user@example.com',
            photo: null,
            familyName: null,
            givenName: null,
          },
        },
      });

      await expect(loginWithGoogle()).rejects.toThrow('idToken');
      expect(mockedSignInWithCredential).not.toHaveBeenCalled();
    });

    it('propagates errors thrown by the Play Services check', async () => {
      const error = Object.assign(new Error('play services'), {
        code: 'mock_PLAY_SERVICES_NOT_AVAILABLE',
      });
      jest.spyOn(GoogleSignin, 'hasPlayServices').mockRejectedValueOnce(error);

      await expect(loginWithGoogle()).rejects.toThrow(error);
      expect(mockedSignInWithCredential).not.toHaveBeenCalled();
    });

    it('propagates errors thrown by signInWithCredential', async () => {
      const error = new Error('auth/account-exists-with-different-credential');
      mockedSignInWithCredential.mockRejectedValue(error);

      await expect(loginWithGoogle()).rejects.toThrow(error);
    });
  });

  describe('sendPasswordReset', () => {
    it('calls sendPasswordResetEmail with the given email', async () => {
      mockedSendPasswordResetEmail.mockResolvedValue(undefined);

      await sendPasswordReset('user@example.com');

      expect(mockedSendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'user@example.com',
      );
    });

    it('propagates errors thrown by sendPasswordResetEmail', async () => {
      const error = new Error('auth/user-not-found');
      mockedSendPasswordResetEmail.mockRejectedValue(error);

      await expect(sendPasswordReset('user@example.com')).rejects.toThrow(error);
    });
  });

  describe('subscribeToAuthChanges', () => {
    it('maps a signed-in firebase user to uid/email', () => {
      mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
        callback({ uid: 'abc123', email: 'user@example.com' });
        return jest.fn();
      });
      const onChange = jest.fn();

      subscribeToAuthChanges(onChange);

      expect(onChange).toHaveBeenCalledWith({ uid: 'abc123', email: 'user@example.com' });
    });

    it('falls back to a null email when the firebase user has none', () => {
      mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
        callback({ uid: 'abc123', email: null });
        return jest.fn();
      });
      const onChange = jest.fn();

      subscribeToAuthChanges(onChange);

      expect(onChange).toHaveBeenCalledWith({ uid: 'abc123', email: null });
    });

    it('calls back with null when there is no session', () => {
      mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
        callback(null);
        return jest.fn();
      });
      const onChange = jest.fn();

      subscribeToAuthChanges(onChange);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('returns the unsubscribe function from onAuthStateChanged', () => {
      const unsubscribe = jest.fn();
      mockedOnAuthStateChanged.mockImplementation(() => unsubscribe);

      const result = subscribeToAuthChanges(jest.fn());

      expect(result).toBe(unsubscribe);
    });
  });

  describe('logout', () => {
    it('calls signOut with the auth instance', async () => {
      mockedSignOut.mockResolvedValue(undefined);

      await logout();

      expect(mockedSignOut).toHaveBeenCalledWith(expect.anything());
    });

    it('also signs out of Google so the next login prompts for an account', async () => {
      mockedSignOut.mockResolvedValue(undefined);
      const googleSignOut = jest.spyOn(GoogleSignin, 'signOut');

      await logout();

      expect(googleSignOut).toHaveBeenCalled();
    });

    it('propagates errors thrown by signOut', async () => {
      const error = new Error('network-error');
      mockedSignOut.mockRejectedValue(error);

      await expect(logout()).rejects.toThrow(error);
    });
  });
});
