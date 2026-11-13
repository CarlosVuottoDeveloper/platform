import type { CalendarDate } from './calendarDate';
import type { Cents } from './money';

export type TransactionKind = 'income' | 'expense' | 'transfer';

export interface Installment {
  groupId: string;
  index: number;
  count: number;
}

export interface Transaction {
  id: string;
  kind: TransactionKind;
  amountCents: Cents;
  date: CalendarDate;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  description: string;
  tags: string[];
  recurrenceId: string | null;
  installment: Installment | null;
}

export type TransactionInput = Omit<Transaction, 'id'>;
