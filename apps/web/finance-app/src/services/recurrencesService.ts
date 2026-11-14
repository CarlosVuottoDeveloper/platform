import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { CalendarDate } from '../domain/calendarDate';
import { dueOccurrences } from '../domain/recurrence';
import type { Recurrence, RecurrenceInput } from '../domain/recurrence';
import { errorCode } from './errorCode';
import { db } from './firebase';
import { materializeRecurrence } from './recurrenceMaterializer';

const recurrencesOf = (uid: string) => collection(db, 'users', uid, 'recurrences');
const recurrenceOf = (uid: string, id: string) => doc(db, 'users', uid, 'recurrences', id);

export function subscribeToRecurrences(
  uid: string,
  onChange: (recurrences: Recurrence[]) => void,
  onError: (code: string) => void,
): () => void {
  return onSnapshot(
    recurrencesOf(uid),
    (snapshot) =>
      onChange(
        snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as Recurrence),
      ),
    (error) => onError(errorCode(error)),
  );
}

export async function createRecurrence(uid: string, input: RecurrenceInput): Promise<string> {
  const created = await addDoc(recurrencesOf(uid), { ...input, materializedThrough: null });
  return created.id;
}

export async function updateRecurrence(
  uid: string,
  id: string,
  input: RecurrenceInput,
): Promise<void> {
  await updateDoc(recurrenceOf(uid, id), { ...input });
}

export async function deleteRecurrence(uid: string, id: string): Promise<void> {
  await deleteDoc(recurrenceOf(uid, id));
}

export async function materializeDueRecurrences(
  uid: string,
  recurrences: Recurrence[],
  today: CalendarDate,
): Promise<void> {
  const withDue = recurrences.filter((recurrence) => dueOccurrences(recurrence, today).length > 0);
  await Promise.allSettled(
    withDue.map((recurrence) => materializeRecurrence(db, uid, recurrence.id, today)),
  );
}
