import type { Account } from './account';
import type { CalendarDate } from './calendarDate';
import type { Cents } from './money';
import type { Recurrence } from './recurrence';
import type { Transaction } from './transaction';

function effectOn(accountId: string, transaction: Transaction): Cents {
  if (transaction.kind === 'transfer') {
    const outgoing = transaction.accountId === accountId ? -transaction.amountCents : 0;
    const incoming = transaction.toAccountId === accountId ? transaction.amountCents : 0;
    return outgoing + incoming;
  }
  if (transaction.accountId !== accountId) return 0;
  return transaction.kind === 'income' ? transaction.amountCents : -transaction.amountCents;
}

const sum = (values: Cents[]) => values.reduce((total, value) => total + value, 0);

export function accountBalanceOn(
  account: Account,
  transactions: Transaction[],
  date: CalendarDate,
): Cents {
  if (date < account.openingDate) return 0;
  const settled = transactions.filter((transaction) => transaction.date <= date);
  return (
    account.initialBalanceCents +
    sum(settled.map((transaction) => effectOn(account.id, transaction)))
  );
}

export function consolidatedBalanceOn(
  accounts: Account[],
  transactions: Transaction[],
  date: CalendarDate,
): Cents {
  return sum(
    accounts
      .filter((account) => !account.archived)
      .map((account) => accountBalanceOn(account, transactions, date)),
  );
}

export function pendingTotalAfter(
  account: Account,
  transactions: Transaction[],
  date: CalendarDate,
): Cents {
  const pending = transactions.filter((transaction) => transaction.date > date);
  return sum(pending.map((transaction) => effectOn(account.id, transaction)));
}

export function isAccountInUse(
  accountId: string,
  transactions: Transaction[],
  recurrences: Recurrence[],
): boolean {
  return (
    transactions.some(
      (transaction) => transaction.accountId === accountId || transaction.toAccountId === accountId,
    ) || recurrences.some((recurrence) => recurrence.accountId === accountId)
  );
}

export function earliestTransactionDate(
  accountId: string,
  transactions: Transaction[],
): CalendarDate | null {
  const dates = transactions
    .filter(
      (transaction) => transaction.accountId === accountId || transaction.toAccountId === accountId,
    )
    .map((transaction) => transaction.date)
    .sort();
  return dates[0] ?? null;
}
