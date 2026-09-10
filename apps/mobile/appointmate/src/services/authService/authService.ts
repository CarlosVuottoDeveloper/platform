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
import { GoogleSignin, isCancelledResponse } from '@react-native-google-signin/google-signin';
import { auth } from '../firebase';

GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });

interface AuthenticatedUser {
  uid: string;
  email: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
}

export async function login(email: string, password: string): Promise<AuthenticatedUser> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return { uid: user.uid, email: user.email ?? email };
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthenticatedUser> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name.trim() });
  return { uid: user.uid, email: user.email ?? email };
}

export async function loginWithGoogle(): Promise<AuthenticatedUser | null> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (isCancelledResponse(response)) return null;

  const { idToken, user: googleUser } = response.data;
  if (!idToken) {
    throw new Error('Google Sign-In returned no idToken; check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  }

  const { user } = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  return { uid: user.uid, email: user.email ?? googleUser.email };
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null);
  });
}

export async function logout(): Promise<void> {
  await GoogleSignin.signOut();
  await signOut(auth);
}
