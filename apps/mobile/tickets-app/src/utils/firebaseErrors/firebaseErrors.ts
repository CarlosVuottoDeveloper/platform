import { FirebaseError } from 'firebase/app';
import { isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

export function mapFirebaseAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado.';
      case 'auth/account-exists-with-different-credential':
        return 'Este e-mail já está cadastrado com outro método de login.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Sem conexão. Verifique sua internet.';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  }
  return 'Ocorreu um erro inesperado.';
}

export function mapGoogleSignInError(err: unknown): string {
  if (isErrorWithCode(err)) {
    switch (err.code) {
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'Google Play Services indisponível. Atualize-o e tente novamente.';
      case statusCodes.IN_PROGRESS:
        return 'Login com Google já em andamento. Aguarde.';
    }
  }
  return mapFirebaseAuthError(err);
}
