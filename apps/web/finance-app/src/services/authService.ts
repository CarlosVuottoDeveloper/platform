import {
  GoogleAuthProvider,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { errorCode } from './errorCode';
import { auth } from './firebase';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

const POPUP_DISMISSED_CODES = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

function isPopupDismissed(error: unknown): boolean {
  return POPUP_DISMISSED_CODES.includes(errorCode(error));
}

export function subscribeToAuthChanges(onChange: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => onChange(user ? toAuthUser(user) : null));
}

export async function loginWithGoogle(): Promise<AuthUser | null> {
  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    return toAuthUser(credential.user);
  } catch (error) {
    if (isPopupDismissed(error)) return null;
    throw error;
  }
}

export function logout(): Promise<void> {
  return signOut(auth);
}

export async function deleteCurrentUser(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteUser(user);
  } catch (error) {
    if (errorCode(error) !== 'auth/requires-recent-login') throw error;
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
    await deleteUser(user);
  }
}
