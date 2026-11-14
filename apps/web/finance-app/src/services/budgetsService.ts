import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { Budget } from '../domain/budget';
import type { Cents } from '../domain/money';
import { errorCode } from './errorCode';
import { db } from './firebase';

const budgetOf = (uid: string, categoryId: string) => doc(db, 'users', uid, 'budgets', categoryId);

export function subscribeToBudgets(
  uid: string,
  onChange: (budgets: Budget[]) => void,
  onError: (code: string) => void,
): () => void {
  return onSnapshot(
    collection(db, 'users', uid, 'budgets'),
    (snapshot) =>
      onChange(
        snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as Budget),
      ),
    (error) => onError(errorCode(error)),
  );
}

export async function setBudget(uid: string, categoryId: string, limitCents: Cents): Promise<void> {
  await setDoc(budgetOf(uid, categoryId), { categoryId, limitCents });
}

export async function deleteBudget(uid: string, categoryId: string): Promise<void> {
  await deleteDoc(budgetOf(uid, categoryId));
}
