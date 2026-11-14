import type { Account } from './account';
import type { CalendarDate, YearMonth } from './calendarDate';
import { yearMonthOf } from './calendarDate';
import type { Category } from './category';
import type { Transaction } from './transaction';

export function groupByDate(
  transactions: Transaction[],
): { date: CalendarDate; items: Transaction[] }[] {
  const dates = [...new Set(transactions.map((transaction) => transaction.date))].sort().reverse();
  return dates.map((date) => ({
    date,
    items: transactions.filter((transaction) => transaction.date === date),
  }));
}

export function isPending(transaction: Transaction, today: CalendarDate): boolean {
  return transaction.date > today;
}

export function accountName(accounts: Account[], id: string): string {
  return accounts.find((account) => account.id === id)?.name ?? 'Conta removida';
}

export function categoryName(categories: Category[], id: string | null): string {
  return categories.find((category) => category.id === id)?.name ?? 'Sem categoria';
}

export function transactionsOfMonth(transactions: Transaction[], month: YearMonth): Transaction[] {
  return transactions.filter((transaction) => yearMonthOf(transaction.date) === month);
}

function searchable(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function matchesSearch(transaction: Transaction, search: string): boolean {
  const term = searchable(search.trim());
  if (term === '') return true;
  return [transaction.description, ...transaction.tags].some((text) =>
    searchable(text).includes(term),
  );
}
