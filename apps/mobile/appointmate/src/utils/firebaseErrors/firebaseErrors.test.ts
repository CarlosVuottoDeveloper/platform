import { FirebaseError } from 'firebase/app';
import { statusCodes } from '@react-native-google-signin/google-signin';
import { mapFirebaseAuthError, mapFirestoreError, mapGoogleSignInError } from './firebaseErrors';

describe('mapFirestoreError', () => {
  it('maps unavailable to a connectivity message', () => {
    const err = new FirebaseError('unavailable', '');
    expect(mapFirestoreError(err, 'fallback')).toBe(
      'Sem conexão. Verifique sua internet e tente novamente.',
    );
  });

  it('returns the given fallback for other firebase error codes', () => {
    const err = new FirebaseError('permission-denied', '');
    expect(mapFirestoreError(err, 'Não foi possível carregar.')).toBe('Não foi possível carregar.');
  });

  it('returns the given fallback for non-firebase errors', () => {
    expect(mapFirestoreError(new Error('plain error'), 'Não foi possível salvar.')).toBe(
      'Não foi possível salvar.',
    );
  });
});

describe('mapFirebaseAuthError', () => {
  it('maps auth/invalid-credential to login error message', () => {
    const err = new FirebaseError('auth/invalid-credential', '');
    expect(mapFirebaseAuthError(err)).toBe('E-mail ou senha incorretos.');
  });

  it('maps auth/wrong-password to login error message', () => {
    const err = new FirebaseError('auth/wrong-password', '');
    expect(mapFirebaseAuthError(err)).toBe('E-mail ou senha incorretos.');
  });

  it('maps auth/user-not-found to login error message', () => {
    const err = new FirebaseError('auth/user-not-found', '');
    expect(mapFirebaseAuthError(err)).toBe('E-mail ou senha incorretos.');
  });

  it('maps auth/email-already-in-use to duplicate email message', () => {
    const err = new FirebaseError('auth/email-already-in-use', '');
    expect(mapFirebaseAuthError(err)).toBe('Este e-mail já está cadastrado.');
  });

  it('maps auth/weak-password to password strength message', () => {
    const err = new FirebaseError('auth/weak-password', '');
    expect(mapFirebaseAuthError(err)).toBe('A senha deve ter pelo menos 6 caracteres.');
  });

  it('maps auth/invalid-email to invalid email message', () => {
    const err = new FirebaseError('auth/invalid-email', '');
    expect(mapFirebaseAuthError(err)).toBe('E-mail inválido.');
  });

  it('maps auth/too-many-requests to rate limit message', () => {
    const err = new FirebaseError('auth/too-many-requests', '');
    expect(mapFirebaseAuthError(err)).toBe('Muitas tentativas. Tente novamente mais tarde.');
  });

  it('maps auth/network-request-failed to network error message', () => {
    const err = new FirebaseError('auth/network-request-failed', '');
    expect(mapFirebaseAuthError(err)).toBe('Sem conexão. Verifique sua internet.');
  });

  it('maps auth/account-exists-with-different-credential to a linked-account message', () => {
    const err = new FirebaseError('auth/account-exists-with-different-credential', '');
    expect(mapFirebaseAuthError(err)).toBe(
      'Este e-mail já está cadastrado com outro método de login.',
    );
  });

  it('maps unknown firebase error code to generic retry message', () => {
    const err = new FirebaseError('auth/unknown-code', '');
    expect(mapFirebaseAuthError(err)).toBe('Ocorreu um erro. Tente novamente.');
  });

  it('maps non-firebase Error to unexpected error message', () => {
    expect(mapFirebaseAuthError(new Error('plain error'))).toBe('Ocorreu um erro inesperado.');
  });

  it('maps null to unexpected error message', () => {
    expect(mapFirebaseAuthError(null)).toBe('Ocorreu um erro inesperado.');
  });
});

describe('mapGoogleSignInError', () => {
  it('maps a missing Play Services error to an install/update message', () => {
    const err = Object.assign(new Error(''), { code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE });
    expect(mapGoogleSignInError(err)).toBe(
      'Google Play Services indisponível. Atualize-o e tente novamente.',
    );
  });

  it('maps a sign-in already in progress error to a wait message', () => {
    const err = Object.assign(new Error(''), { code: statusCodes.IN_PROGRESS });
    expect(mapGoogleSignInError(err)).toBe('Login com Google já em andamento. Aguarde.');
  });

  it('falls back to the firebase auth mapping for firebase errors', () => {
    const err = new FirebaseError('auth/network-request-failed', '');
    expect(mapGoogleSignInError(err)).toBe('Sem conexão. Verifique sua internet.');
  });

  it('falls back to the firebase auth mapping for unknown errors', () => {
    expect(mapGoogleSignInError(new Error('plain error'))).toBe('Ocorreu um erro inesperado.');
  });
});
