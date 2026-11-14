import type { Account } from './account';
import type { Budget } from './budget';
import type { CalendarDate } from './calendarDate';
import type { Category } from './category';
import type { Contribution, Goal } from './goal';
import type { Recurrence } from './recurrence';
import type { Transaction } from './transaction';

export interface UserDataSnapshot {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurrences: Recurrence[];
  budgets: Budget[];
  goals: (Goal & { contributions: Contribution[] })[];
}

const EXPORT_VERSION = 1;

export function buildDataExport(data: UserDataSnapshot, exportedAt: CalendarDate): string {
  return JSON.stringify({ version: EXPORT_VERSION, exportedAt, ...data }, null, 2);
}
