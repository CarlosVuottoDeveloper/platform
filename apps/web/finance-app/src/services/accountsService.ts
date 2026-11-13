import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { Account, AccountInput } from '../domain/account';
import { db } from './firebase';
import { errorCode } from './errorCode';

const accountsOf = (uid: string) => collection(db, 'users', uid, 'accounts');
const accountOf = (uid: string, id: string) => doc(db, 'users', uid, 'accounts', id);

export function subscribeToAccounts(
  uid: string,
  onChange: (accounts: Account[]) => void,
  onError: (code: string) => void,
): () => void {
  return onSnapshot(
    accountsOf(uid),
    (snapshot) =>
      onChange(
        snapshot.docs.map((document) => {
          const { createdAt: _createdAt, ...fields } = document.data();
          return { id: document.id, ...fields } as Account;
        }),
      ),
    (error) => onError(errorCode(error)),
  );
}

export async function createAccount(uid: string, input: AccountInput): Promise<string> {
  const created = await addDoc(accountsOf(uid), {
    ...input,
    archived: false,
    createdAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateAccount(uid: string, id: string, input: AccountInput): Promise<void> {
  await updateDoc(accountOf(uid, id), { ...input });
}

export async function setAccountArchived(
  uid: string,
  id: string,
  archived: boolean,
): Promise<void> {
  await updateDoc(accountOf(uid, id), { archived });
}

export async function deleteAccount(uid: string, id: string): Promise<void> {
  await deleteDoc(accountOf(uid, id));
}
