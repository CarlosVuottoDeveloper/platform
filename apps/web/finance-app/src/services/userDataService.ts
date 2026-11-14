import { collection, getDocs } from 'firebase/firestore';
import { toCalendarDate } from '../domain/calendarDate';
import { buildDataExport } from '../domain/dataExport';
import type { UserDataSnapshot } from '../domain/dataExport';
import { downloadJson } from './exportService';
import { db } from './firebase';
import { eraseUserTree } from './userDataEraser';

async function readAll<T>(...path: [string, ...string[]]): Promise<T[]> {
  const snapshot = await getDocs(collection(db, ...path));
  return snapshot.docs.map((document) => {
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...fields } = document.data();
    return { id: document.id, ...fields } as T;
  });
}

async function readSnapshot(uid: string): Promise<UserDataSnapshot> {
  const read = <T>(name: string) => readAll<T>('users', uid, name);
  const goals = await read<UserDataSnapshot['goals'][number]>('goals');
  return {
    accounts: await read('accounts'),
    categories: await read('categories'),
    transactions: await read('transactions'),
    recurrences: await read('recurrences'),
    budgets: await read('budgets'),
    goals: await Promise.all(
      goals.map(async (goal) => ({
        ...goal,
        contributions: await readAll('users', uid, 'goals', goal.id, 'contributions'),
      })),
    ),
  };
}

export async function downloadAllData(uid: string): Promise<void> {
  const today = toCalendarDate(new Date());
  downloadJson(buildDataExport(await readSnapshot(uid), today), `financas-${today}.json`);
}

export async function deleteAllUserData(uid: string): Promise<void> {
  await eraseUserTree(db, uid);
}
