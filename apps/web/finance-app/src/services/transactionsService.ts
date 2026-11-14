import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { buildInstallments } from '../domain/installment';
import type { Transaction, TransactionInput } from '../domain/transaction';
import { errorCode } from './errorCode';
import { db } from './firebase';

const transactionsOf = (uid: string) => collection(db, 'users', uid, 'transactions');
const transactionOf = (uid: string, id: string) => doc(db, 'users', uid, 'transactions', id);

const stamped = (input: TransactionInput) => ({
  ...input,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export function subscribeToTransactions(
  uid: string,
  onChange: (transactions: Transaction[]) => void,
  onError: (code: string) => void,
): () => void {
  return onSnapshot(
    transactionsOf(uid),
    (snapshot) =>
      onChange(
        snapshot.docs.map((document) => {
          const { createdAt: _createdAt, updatedAt: _updatedAt, ...fields } = document.data();
          return { id: document.id, ...fields } as Transaction;
        }),
      ),
    (error) => onError(errorCode(error)),
  );
}

export async function createTransaction(uid: string, input: TransactionInput): Promise<string> {
  const created = await addDoc(transactionsOf(uid), stamped(input));
  return created.id;
}

export async function createTransactions(uid: string, inputs: TransactionInput[]): Promise<void> {
  const batch = writeBatch(db);
  inputs.forEach((input) => batch.set(doc(transactionsOf(uid)), stamped(input)));
  await batch.commit();
}

export async function createInstallments(
  uid: string,
  draft: TransactionInput,
  count: number,
): Promise<void> {
  const groupId = doc(transactionsOf(uid)).id;
  await createTransactions(uid, buildInstallments(draft, count, groupId));
}

export async function updateTransaction(
  uid: string,
  id: string,
  input: TransactionInput,
): Promise<void> {
  await updateDoc(transactionOf(uid, id), { ...input, updatedAt: serverTimestamp() });
}

export async function updateTransactions(
  uid: string,
  updates: { id: string; input: TransactionInput }[],
): Promise<void> {
  const batch = writeBatch(db);
  updates.forEach(({ id, input }) =>
    batch.update(transactionOf(uid, id), { ...input, updatedAt: serverTimestamp() }),
  );
  await batch.commit();
}

export async function deleteTransactions(uid: string, ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(transactionOf(uid, id)));
  await batch.commit();
}
