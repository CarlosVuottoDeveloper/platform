import type { Account } from './account';
import { consolidatedBalanceOn } from './balance';
import { lastDayOfMonth, yearMonthOf } from './calendarDate';
import type { CalendarDate, YearMonth } from './calendarDate';
import type { Cents } from './money';
import { projectedOccurrences } from './recurrence';
import type { Recurrence } from './recurrence';
import type { Transaction, TransactionKind } from './transaction';

export interface MonthSummary {
  balanceCents: Cents;
  incomeCents: Cents;
  expenseCents: Cents;
  expectedEndBalanceCents: Cents;
}

interface MonthSummaryInput {
  accounts: Account[];
  transactions: Transaction[];
  recurrences: Recurrence[];
  month: YearMonth;
  today: CalendarDate;
}

function totalOf(transactions: Transaction[], kind: TransactionKind): Cents {
  return transactions
    .filter((transaction) => transaction.kind === kind)
    .reduce((total, transaction) => total + transaction.amountCents, 0);
}

export function summarizeMonth({
  accounts,
  transactions,
  recurrences,
  month,
  today,
}: MonthSummaryInput): MonthSummary {
  const monthEnd = lastDayOfMonth(month);
  const asOf = monthEnd < today ? monthEnd : today;
  const realised = transactions.filter(
    (transaction) => yearMonthOf(transaction.date) === month && transaction.date <= asOf,
  );
  const scheduled = [...transactions, ...projectedOccurrences(recurrences, today, monthEnd)];

  return {
    balanceCents: consolidatedBalanceOn(accounts, transactions, asOf),
    incomeCents: totalOf(realised, 'income'),
    expenseCents: totalOf(realised, 'expense'),
    expectedEndBalanceCents: consolidatedBalanceOn(accounts, scheduled, monthEnd),
  };
}
