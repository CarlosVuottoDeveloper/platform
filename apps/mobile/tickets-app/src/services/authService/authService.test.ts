import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  getAuth,
  onAuthStateChanged,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { collection, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { initializeApp, deleteApp, FirebaseError } from 'firebase/app';
import { auth as authMock, db as dbMock, firebaseConfig as firebaseConfigMock } from '../firebase';
import {
  getUserProfile,
  login,
  loginWithGoogle,
  register,
  subscribeToAuthUser,
  createUser,
  logout,
  sendPasswordReset,
  subscribeToUsers,
  mapFirebaseAuthError,
} from './authService';
import type { User } from '../../domain/user';

jest.mock('../firebase', () => ({
  auth: { __type: 'auth' },
  db: { __type: 'db' },
  firebaseConfig: { apiKey: 'test-api-key' },
}));

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: { credential: jest.fn() },
  signInWithCredential: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_db, path) => ({ __type: 'collection', path })),
  doc: jest.fn(() => ({ __type: 'doc', id: 'generated-id' })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn((col, ...constraints) => ({ __type: 'query', col, constraints })),
  where: jest.fn((field, op, value) => ({ __type: 'where', field, op, value })),
  serverTimestamp: jest.fn(() => '__server_timestamp__'),
}));

jest.mock('firebase/app', () => {
  const actual = jest.requireActual('firebase/app');
  return {
    ...actual,
    initializeApp: jest.fn(),
    deleteApp: jest.fn(),
  };
});

const mockSignIn = signInWithEmailAndPassword as jest.Mock;
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.Mock;
const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockSignInWithCredential = signInWithCredential as jest.Mock;
const mockGoogleCredential = GoogleAuthProvider.credential as jest.Mock;
const mockGetAuth = getAuth as jest.Mock;
const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;

const mockCollection = collection as jest.Mock;
const mockDoc = doc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;
const mockOnSnapshot = onSnapshot as jest.Mock;
const mockQuery = query as jest.Mock;
const mockWhere = where as jest.Mock;

const mockInitializeApp = initializeApp as jest.Mock;
const mockDeleteApp = deleteApp as jest.Mock;

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in with firebase and returns a User built from the users/{uid} document', async () => {
    mockSignIn.mockResolvedValue({ user: { uid: 'u1', email: 'user@test.com' } });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Alice', role: 'admin', workspace_id: 'ws-1' }),
    });

    const result = await login('user@test.com', 'secret');

    expect(mockSignIn).toHaveBeenCalledWith(authMock, 'user@test.com', 'secret');
    expect(mockDoc).toHaveBeenCalledWith(dbMock, 'users', 'u1');
    expect(result).toEqual({
      uid: 'u1',
      email: 'user@test.com',
      name: 'Alice',
      role: 'admin',
      workspaceId: 'ws-1',
    });
  });

  it('rejects when the account has no users/{uid} profile instead of returning an empty workspace', async () => {
    mockSignIn.mockResolvedValue({ user: { uid: 'u2', email: 'user2@test.com' } });
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => undefined });

    await expect(login('user2@test.com', 'secret')).rejects.toThrow(
      'Perfil não encontrado. Fale com o administrador do workspace.',
    );
  });

  it('falls back to the provided login email when the firebase user has none', async () => {
    mockSignIn.mockResolvedValue({ user: { uid: 'u3', email: null } });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({}) });

    const result = await login('typed@test.com', 'secret');

    expect(result.email).toBe('typed@test.com');
    expect(result.name).toBe('typed@test.com');
  });

  it('propagates the error thrown by signInWithEmailAndPassword', async () => {
    mockSignIn.mockRejectedValue(new Error('invalid credentials'));

    await expect(login('user@test.com', 'wrong')).rejects.toThrow('invalid credentials');
  });
});

describe('loginWithGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogleCredential.mockReturnValue('google-credential');
    mockSignInWithCredential.mockResolvedValue({
      user: { uid: 'uid-google', email: 'ada@example.com' },
    });
  });

  it('signs in to Firebase with the credential built from the Google idToken', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({}) });

    await loginWithGoogle();

    expect(mockGoogleCredential).toHaveBeenCalledWith('mockIdToken');
    expect(mockSignInWithCredential).toHaveBeenCalledWith(authMock, 'google-credential');
  });

  it('returns the existing profile without writing anything when users/{uid} exists', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Ada', role: 'standard', workspace_id: 'ws-existing' }),
    });

    const result = await loginWithGoogle();

    expect(result).toEqual({
      uid: 'uid-google',
      email: 'ada@example.com',
      name: 'Ada',
      role: 'standard',
      workspaceId: 'ws-existing',
    });
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('founds a new workspace with the user as admin on the first Google sign-in', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => undefined });

    const result = await loginWithGoogle();

    expect(mockSetDoc).toHaveBeenNthCalledWith(1, expect.anything(), {
      email: 'ada@example.com',
      role: 'admin',
      name: 'mockFullName',
      workspace_id: 'generated-id',
    });
    expect(mockSetDoc).toHaveBeenNthCalledWith(2, expect.anything(), {
      createdAt: '__server_timestamp__',
      owner_id: 'uid-google',
    });
    expect(result).toEqual({
      uid: 'uid-google',
      email: 'ada@example.com',
      name: 'mockFullName',
      role: 'admin',
      workspaceId: 'generated-id',
    });
  });

  it('names the new profile after the e-mail when Google provides no name', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => undefined });
    jest.spyOn(GoogleSignin, 'signIn').mockResolvedValueOnce({
      type: 'success',
      data: {
        idToken: 'mockIdToken',
        serverAuthCode: null,
        scopes: [],
        user: {
          id: 'mockId',
          name: null,
          email: 'google@example.com',
          photo: null,
          familyName: null,
          givenName: null,
        },
      },
    });

    const result = await loginWithGoogle();

    expect(result?.name).toBe('ada@example.com');
  });

  it('falls back to the Google account e-mail when the firebase user has none', async () => {
    mockSignInWithCredential.mockResolvedValue({ user: { uid: 'uid-google', email: null } });
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({}) });

    const result = await loginWithGoogle();

    expect(result?.email).toBe('mockEmail');
  });

  it('returns null without touching Firebase when the user cancels the Google prompt', async () => {
    jest.spyOn(GoogleSignin, 'signIn').mockResolvedValueOnce({ type: 'cancelled', data: null });

    const result = await loginWithGoogle();

    expect(result).toBeNull();
    expect(mockSignInWithCredential).not.toHaveBeenCalled();
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
          email: 'google@example.com',
          photo: null,
          familyName: null,
          givenName: null,
        },
      },
    });

    await expect(loginWithGoogle()).rejects.toThrow('idToken');
    expect(mockSignInWithCredential).not.toHaveBeenCalled();
  });

  it('propagates errors thrown by the Play Services check', async () => {
    const error = Object.assign(new Error('play services'), {
      code: 'mock_PLAY_SERVICES_NOT_AVAILABLE',
    });
    jest.spyOn(GoogleSignin, 'hasPlayServices').mockRejectedValueOnce(error);

    await expect(loginWithGoogle()).rejects.toThrow(error);
    expect(mockSignInWithCredential).not.toHaveBeenCalled();
  });
});

describe('register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writes the users document before the workspaces document and returns the new admin User', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'new-uid' } });
    mockSetDoc.mockResolvedValue(undefined);

    const result = await register('  Alice  ', 'alice@test.com', 'secret');

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      authMock,
      'alice@test.com',
      'secret',
    );
    expect(mockSetDoc).toHaveBeenCalledTimes(2);
    expect(mockSetDoc.mock.calls[0]?.[1]).toEqual({
      email: 'alice@test.com',
      role: 'admin',
      name: 'Alice',
      workspace_id: 'generated-id',
    });
    expect(mockSetDoc.mock.calls[1]?.[1]).toEqual({
      createdAt: '__server_timestamp__',
      owner_id: 'new-uid',
    });
    expect(result).toEqual({
      uid: 'new-uid',
      email: 'alice@test.com',
      name: 'Alice',
      role: 'admin',
      workspaceId: 'generated-id',
    });
  });

  it('propagates the error thrown by createUserWithEmailAndPassword', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error('email already in use'));

    await expect(register('Alice', 'alice@test.com', 'secret')).rejects.toThrow(
      'email already in use',
    );
    expect(mockSetDoc).not.toHaveBeenCalled();
  });
});

describe('createUser', () => {
  const disposableApp = { __type: 'disposableApp' };
  const disposableAuth = { __type: 'disposableAuth' };
  const creator: User = {
    uid: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin',
    role: 'admin',
    workspaceId: 'ws-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockInitializeApp.mockReturnValue(disposableApp);
    mockGetAuth.mockReturnValue(disposableAuth);
  });

  it('creates the user via a disposable app instance, writes the users document, signs out and deletes the app', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'created-uid' } });
    mockSetDoc.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);
    mockDeleteApp.mockResolvedValue(undefined);

    await createUser('Bob', ' bob@test.com ', 'secret', 'standard', creator);

    expect(mockInitializeApp).toHaveBeenCalledWith(
      firebaseConfigMock,
      expect.stringMatching(/^disposable-\d+$/),
    );
    expect(mockGetAuth).toHaveBeenCalledWith(disposableApp);
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      disposableAuth,
      'bob@test.com',
      'secret',
    );
    expect(mockSetDoc).toHaveBeenCalledWith(expect.anything(), {
      email: 'bob@test.com',
      name: 'Bob',
      role: 'standard',
      workspace_id: 'ws-1',
    });
    expect(mockSignOut).toHaveBeenCalledWith(disposableAuth);
    expect(mockDeleteApp).toHaveBeenCalledWith(disposableApp);
  });

  it('deletes the disposable app and surfaces a friendly message when creation fails with a FirebaseError', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'boom'),
    );
    mockDeleteApp.mockResolvedValue(undefined);

    await expect(createUser('Bob', 'bob@test.com', 'secret', 'standard', creator)).rejects.toThrow(
      'Não foi possível criar o usuário.',
    );

    expect(mockSetDoc).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockDeleteApp).toHaveBeenCalledWith(disposableApp);
  });

  it('deletes the disposable app and surfaces the original message for a plain Error', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error('network down'));
    mockDeleteApp.mockResolvedValue(undefined);

    await expect(createUser('Bob', 'bob@test.com', 'secret', 'standard', creator)).rejects.toThrow(
      'network down',
    );

    expect(mockDeleteApp).toHaveBeenCalledWith(disposableApp);
  });

  it('deletes the disposable app and surfaces a fallback message for a non-Error rejection', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue('unexpected string rejection');
    mockDeleteApp.mockResolvedValue(undefined);

    await expect(createUser('Bob', 'bob@test.com', 'secret', 'standard', creator)).rejects.toThrow(
      'Falha ao criar usuário',
    );

    expect(mockDeleteApp).toHaveBeenCalledWith(disposableApp);
  });

  it('does not let a failing deleteApp mask the original error', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error('network down'));
    mockDeleteApp.mockRejectedValue(new Error('delete also failed'));

    await expect(createUser('Bob', 'bob@test.com', 'secret', 'standard', creator)).rejects.toThrow(
      'network down',
    );
  });
});

describe('sendPasswordReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to sendPasswordResetEmail with the shared auth instance', async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined);

    await sendPasswordReset('user@test.com');

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(authMock, 'user@test.com');
  });
});

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs out of the shared auth instance', async () => {
    mockSignOut.mockResolvedValue(undefined);

    await logout();

    expect(mockSignOut).toHaveBeenCalledWith(authMock);
  });

  it('also signs out of Google so the next login prompts for an account', async () => {
    mockSignOut.mockResolvedValue(undefined);
    const googleSignOut = jest.spyOn(GoogleSignin, 'signOut');

    await logout();

    expect(googleSignOut).toHaveBeenCalled();
  });
});

describe('subscribeToUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queries users filtered by workspace_id and maps snapshot docs to User[]', () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockReturnValue(unsubscribe);
    const onData = jest.fn();
    const onError = jest.fn();

    const result = subscribeToUsers('ws-1', onData, onError);

    expect(mockCollection).toHaveBeenCalledWith(dbMock, 'users');
    expect(mockWhere).toHaveBeenCalledWith('workspace_id', '==', 'ws-1');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockOnSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ __type: 'query' }),
      expect.any(Function),
      onError,
    );
    expect(result).toBe(unsubscribe);

    const snapshotCallback = mockOnSnapshot.mock.calls[0]?.[1];
    snapshotCallback({
      docs: [
        {
          id: 'u1',
          data: () => ({ email: 'a@test.com', name: 'A', role: 'admin', workspace_id: 'ws-1' }),
        },
        { id: 'u2', data: () => ({}) },
      ],
    });

    expect(onData).toHaveBeenCalledWith([
      { uid: 'u1', email: 'a@test.com', name: 'A', role: 'admin', workspaceId: 'ws-1' },
      { uid: 'u2', email: '', name: '', role: 'standard', workspaceId: '' },
    ]);
  });
});

describe('getUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps the users/{uid} document to a User', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Alice', role: 'admin', workspace_id: 'ws-1' }),
    });

    const result = await getUserProfile('u1', 'alice@test.com');

    expect(mockDoc).toHaveBeenCalledWith(dbMock, 'users', 'u1');
    expect(result).toEqual({
      uid: 'u1',
      email: 'alice@test.com',
      name: 'Alice',
      role: 'admin',
      workspaceId: 'ws-1',
    });
  });

  it('falls back to the e-mail as name and to the standard role when fields are missing', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ workspace_id: 'ws-1' }) });

    const result = await getUserProfile('u1', 'alice@test.com');

    expect(result).toEqual({
      uid: 'u1',
      email: 'alice@test.com',
      name: 'alice@test.com',
      role: 'standard',
      workspaceId: 'ws-1',
    });
  });

  it('returns null when the account has no profile document yet', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => undefined });

    await expect(getUserProfile('u1', 'alice@test.com')).resolves.toBeNull();
  });
});

describe('subscribeToAuthUser', () => {
  const onChange = jest.fn();
  const onError = jest.fn();

  function fireAuthChange(firebaseUser: { uid: string; email: string | null } | null) {
    const listener = mockOnAuthStateChanged.mock.calls[0]?.[1];
    return listener(firebaseUser);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockReturnValue(jest.fn());
  });

  it('listens to the shared auth instance and returns its unsubscribe', () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    expect(subscribeToAuthUser(onChange, onError)).toBe(unsubscribe);
    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(authMock, expect.any(Function));
  });

  it('publishes null when there is no signed-in user', async () => {
    subscribeToAuthUser(onChange, onError);

    await fireAuthChange(null);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it('publishes the profile of the signed-in user', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Ana', role: 'standard', workspace_id: 'ws-1' }),
    });
    subscribeToAuthUser(onChange, onError);

    await fireAuthChange({ uid: 'u1', email: 'ana@test.com' });

    expect(onChange).toHaveBeenCalledWith({
      uid: 'u1',
      email: 'ana@test.com',
      name: 'Ana',
      role: 'standard',
      workspaceId: 'ws-1',
    });
  });

  it('publishes null while the signed-in account still has no profile document', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => undefined });
    subscribeToAuthUser(onChange, onError);

    await fireAuthChange({ uid: 'u-new', email: 'new@test.com' });

    expect(onChange).toHaveBeenCalledWith(null);
    expect(onError).not.toHaveBeenCalled();
  });

  it('uses an empty e-mail when the auth user has none', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ workspace_id: 'ws-1' }) });
    subscribeToAuthUser(onChange, onError);

    await fireAuthChange({ uid: 'u1', email: null });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ email: '', name: '' }));
  });

  it('reports an error instead of publishing when the profile fetch fails', async () => {
    mockGetDoc.mockRejectedValue(new Error('network down'));
    subscribeToAuthUser(onChange, onError);

    await fireAuthChange({ uid: 'u1', email: 'ana@test.com' });

    expect(onChange).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('mapFirebaseAuthError', () => {
  it('is re-exported from the shared firebaseErrors utility', () => {
    const err = new FirebaseError('auth/invalid-credential', 'boom');

    expect(mapFirebaseAuthError(err)).toBe('E-mail ou senha incorretos.');
  });
});
