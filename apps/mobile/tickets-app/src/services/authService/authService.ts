import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { GoogleSignin, isCancelledResponse } from '@react-native-google-signin/google-signin';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { initializeApp, deleteApp, FirebaseError } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { auth, db, firebaseConfig } from '../firebase';
import { mapFirebaseAuthError, mapGoogleSignInError } from '../../utils/firebaseErrors';
import type { User, UserRole } from '../../domain/user';

GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });

function toUser(uid: string, email: string, data: DocumentData): User {
  return {
    uid,
    email,
    name: (data.name ?? email) as string,
    role: (data.role ?? 'standard') as UserRole,
    workspaceId: (data.workspace_id ?? '') as string,
  };
}

export async function getUserProfile(uid: string, email: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return toUser(uid, email, snap.data());
}

export function subscribeToAuthUser(
  onChange: (user: User | null) => void,
  onError: () => void,
): Unsubscribe {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      onChange(null);
      return;
    }
    try {
      onChange(await getUserProfile(firebaseUser.uid, firebaseUser.email ?? ''));
    } catch {
      onError();
    }
  });
}

export async function login(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(user.uid, user.email ?? email);
  if (!profile) throw new Error('Perfil não encontrado. Fale com o administrador do workspace.');
  return profile;
}

async function foundWorkspace(uid: string, email: string, name: string): Promise<User> {
  const workspaceId = doc(collection(db, 'workspaces')).id;

  await setDoc(doc(db, 'users', uid), {
    email,
    role: 'admin',
    name,
    workspace_id: workspaceId,
  });

  await setDoc(doc(db, 'workspaces', workspaceId), {
    createdAt: serverTimestamp(),
    owner_id: uid,
  });

  return { uid, email, name, role: 'admin', workspaceId };
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return foundWorkspace(user.uid, email, name.trim());
}

export async function loginWithGoogle(): Promise<User | null> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (isCancelledResponse(response)) return null;

  const { idToken, user: googleUser } = response.data;
  if (!idToken) {
    throw new Error('Google Sign-In returned no idToken; check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  }

  const { user } = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  const email = user.email ?? googleUser.email;

  const profile = await getUserProfile(user.uid, email);
  return profile ?? foundWorkspace(user.uid, email, googleUser.name?.trim() || email);
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  creator: User,
): Promise<void> {
  const disposableApp = initializeApp(firebaseConfig, `disposable-${Date.now()}`);
  const disposableAuth = getAuth(disposableApp);
  const trimmedEmail = email.trim();
  try {
    const { user } = await createUserWithEmailAndPassword(disposableAuth, trimmedEmail, password);
    await setDoc(doc(db, 'users', user.uid), {
      email: trimmedEmail,
      name: name.trim(),
      role,
      workspace_id: creator.workspaceId,
    });
    await signOut(disposableAuth);
  } catch (err: unknown) {
    const message =
      err instanceof FirebaseError
        ? 'Não foi possível criar o usuário.'
        : err instanceof Error
          ? err.message
          : 'Falha ao criar usuário';
    throw new Error(message);
  } finally {
    await deleteApp(disposableApp).catch(() => undefined);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logout(): Promise<void> {
  await GoogleSignin.signOut();
  await signOut(auth);
}

export function subscribeToUsers(
  workspaceId: string,
  onData: (users: User[]) => void,
  onError: () => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'users'), where('workspace_id', '==', workspaceId)),
    (snap) => {
      const users: User[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          email: (data.email ?? '') as string,
          name: (data.name ?? '') as string,
          role: (data.role ?? 'standard') as UserRole,
          workspaceId: (data.workspace_id ?? '') as string,
        };
      });
      onData(users);
    },
    onError,
  );
}

export { mapFirebaseAuthError, mapGoogleSignInError };
