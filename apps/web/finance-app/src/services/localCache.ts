import { clearIndexedDbPersistence, terminate } from 'firebase/firestore';
import { db } from './firebase';

export async function clearLocalCache(): Promise<void> {
  await terminate(db);
  await clearIndexedDbPersistence(db).catch(() => undefined);
}
