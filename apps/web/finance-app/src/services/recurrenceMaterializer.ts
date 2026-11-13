import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { CalendarDate } from '../domain/calendarDate';
import { dueOccurrences } from '../domain/recurrence';
import type { Recurrence } from '../domain/recurrence';

export async function materializeRecurrence(
  db: Firestore,
  uid: string,
  recurrenceId: string,
  today: CalendarDate,
): Promise<void> {
  const recurrenceRef = doc(db, 'users', uid, 'recurrences', recurrenceId);
  await runTransaction(db, async (transaction) => {
    const stored = await transaction.get(recurrenceRef);
    if (!stored.exists()) return;
    const due = dueOccurrences({ id: recurrenceId, ...stored.data() } as Recurrence, today);
    const last = due[due.length - 1];
    if (!last) return;
    due.forEach((occurrence) =>
      transaction.set(doc(db, 'users', uid, 'transactions', occurrence.id), {
        ...occurrence.input,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    transaction.update(recurrenceRef, { materializedThrough: last.month });
  });
}
