import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import type { DocumentReference, Firestore } from 'firebase/firestore';

const BATCH_LIMIT = 500;
const TOP_LEVEL_COLLECTIONS = ['accounts', 'categories', 'transactions', 'recurrences', 'budgets'];

async function deleteAll(db: Firestore, references: DocumentReference[]): Promise<void> {
  for (let start = 0; start < references.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    references.slice(start, start + BATCH_LIMIT).forEach((reference) => batch.delete(reference));
    await batch.commit();
  }
}

async function referencesIn(db: Firestore, ...path: [string, ...string[]]) {
  const snapshot = await getDocs(collection(db, ...path));
  return snapshot.docs.map((document) => document.ref);
}

export async function eraseUserTree(db: Firestore, uid: string): Promise<void> {
  const goals = await referencesIn(db, 'users', uid, 'goals');
  const contributions = await Promise.all(
    goals.map((goal) => referencesIn(db, 'users', uid, 'goals', goal.id, 'contributions')),
  );
  const topLevel = await Promise.all(
    TOP_LEVEL_COLLECTIONS.map((name) => referencesIn(db, 'users', uid, name)),
  );
  await deleteAll(db, [
    ...contributions.flat(),
    ...goals,
    ...topLevel.flat(),
    doc(db, 'users', uid),
  ]);
}
