import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import type { Contribution, ContributionInput, Goal, GoalInput } from '../domain/goal';
import { errorCode } from './errorCode';
import { db } from './firebase';

const goalsOf = (uid: string) => collection(db, 'users', uid, 'goals');
const goalOf = (uid: string, goalId: string) => doc(db, 'users', uid, 'goals', goalId);
const contributionsOf = (uid: string, goalId: string) =>
  collection(db, 'users', uid, 'goals', goalId, 'contributions');

export function subscribeToGoals(
  uid: string,
  onChange: (goals: Goal[]) => void,
  onError: (code: string) => void,
): () => void {
  return onSnapshot(
    goalsOf(uid),
    (snapshot) =>
      onChange(snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as Goal)),
    (error) => onError(errorCode(error)),
  );
}

export function subscribeToContributions(
  uid: string,
  goalId: string,
  onChange: (contributions: Contribution[]) => void,
  onError: (code: string) => void,
): () => void {
  return onSnapshot(
    contributionsOf(uid, goalId),
    (snapshot) =>
      onChange(
        snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as Contribution),
      ),
    (error) => onError(errorCode(error)),
  );
}

export async function createGoal(uid: string, input: GoalInput): Promise<string> {
  const created = await addDoc(goalsOf(uid), { ...input });
  return created.id;
}

export async function updateGoal(uid: string, goalId: string, input: GoalInput): Promise<void> {
  await updateDoc(goalOf(uid, goalId), { ...input });
}

export async function deleteGoal(uid: string, goalId: string): Promise<void> {
  const contributions = await getDocs(contributionsOf(uid, goalId));
  const batch = writeBatch(db);
  contributions.docs.forEach((document) => batch.delete(document.ref));
  batch.delete(goalOf(uid, goalId));
  await batch.commit();
}

export async function addContribution(
  uid: string,
  goalId: string,
  input: ContributionInput,
): Promise<void> {
  await addDoc(contributionsOf(uid, goalId), { ...input });
}

export async function deleteContribution(
  uid: string,
  goalId: string,
  contributionId: string,
): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'goals', goalId, 'contributions', contributionId));
}
