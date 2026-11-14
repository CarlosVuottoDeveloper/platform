import { addMonths, dateInMonth, monthsBetween, yearMonthOf } from './calendarDate';
import type { CalendarDate, YearMonth } from './calendarDate';
import type { Cents } from './money';
import type { Transaction, TransactionInput } from './transaction';

export interface Recurrence {
  id: string;
  kind: 'income' | 'expense';
  amountCents: Cents;
  dayOfMonth: number;
  accountId: string;
  categoryId: string;
  description: string;
  tags: string[];
  startMonth: YearMonth;
  endMonth: YearMonth | null;
  materializedThrough: YearMonth | null;
}

export type RecurrenceInput = Omit<Recurrence, 'id' | 'materializedThrough'>;

interface Occurrence {
  id: string;
  month: YearMonth;
  input: TransactionInput;
}

function occurrenceId(recurrenceId: string, month: YearMonth): string {
  return `${recurrenceId}_${month}`;
}

function occurrenceIn(recurrence: Recurrence, month: YearMonth): Occurrence {
  return {
    id: occurrenceId(recurrence.id, month),
    month,
    input: {
      kind: recurrence.kind,
      amountCents: recurrence.amountCents,
      date: dateInMonth(month, recurrence.dayOfMonth),
      accountId: recurrence.accountId,
      toAccountId: null,
      categoryId: recurrence.categoryId,
      description: recurrence.description,
      tags: recurrence.tags,
      recurrenceId: recurrence.id,
      installment: null,
    },
  };
}

function pendingOccurrences(recurrence: Recurrence, throughMonth: YearMonth): Occurrence[] {
  const firstPending = recurrence.materializedThrough
    ? addMonths(recurrence.materializedThrough, 1)
    : recurrence.startMonth;
  const first = firstPending > recurrence.startMonth ? firstPending : recurrence.startMonth;
  const last =
    recurrence.endMonth && recurrence.endMonth < throughMonth ? recurrence.endMonth : throughMonth;
  return monthsBetween(first, last).map((month) => occurrenceIn(recurrence, month));
}

export function dueOccurrences(recurrence: Recurrence, today: CalendarDate): Occurrence[] {
  return pendingOccurrences(recurrence, yearMonthOf(today)).filter(
    (occurrence) => occurrence.input.date <= today,
  );
}

export function projectedOccurrences(
  recurrences: Recurrence[],
  after: CalendarDate,
  through: CalendarDate,
): Transaction[] {
  return recurrences.flatMap((recurrence) =>
    pendingOccurrences(recurrence, yearMonthOf(through))
      .filter((occurrence) => occurrence.input.date > after && occurrence.input.date <= through)
      .map((occurrence) => ({ id: occurrence.id, ...occurrence.input })),
  );
}
