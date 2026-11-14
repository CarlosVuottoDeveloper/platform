import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../domain/category';
import type { Category, CategoryInput } from '../domain/category';
import { errorCode } from './errorCode';
import { db } from './firebase';

const categoriesOf = (uid: string) => collection(db, 'users', uid, 'categories');
const categoryOf = (uid: string, id: string) => doc(db, 'users', uid, 'categories', id);

export function subscribeToCategories(
  uid: string,
  onChange: (categories: Category[]) => void,
  onError: (code: string) => void,
): () => void {
  return onSnapshot(
    categoriesOf(uid),
    (snapshot) =>
      onChange(
        snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as Category),
      ),
    (error) => onError(errorCode(error)),
  );
}

export async function createCategory(uid: string, input: CategoryInput): Promise<string> {
  const created = await addDoc(categoriesOf(uid), { ...input, archived: false });
  return created.id;
}

export async function updateCategory(uid: string, id: string, input: CategoryInput): Promise<void> {
  await updateDoc(categoryOf(uid, id), { ...input });
}

export async function setCategoryArchived(
  uid: string,
  id: string,
  archived: boolean,
): Promise<void> {
  await updateDoc(categoryOf(uid, id), { archived });
}

export async function seedDefaultCategories(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (transaction) => {
    const userDocument = await transaction.get(userRef);
    if (userDocument.exists()) return;
    DEFAULT_CATEGORIES.forEach(({ id, ...fields }) => transaction.set(categoryOf(uid, id), fields));
    transaction.set(userRef, { seededAt: serverTimestamp() });
  });
}
