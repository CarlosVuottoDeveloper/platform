import { yearMonthOf } from './calendarDate';
import type { YearMonth } from './calendarDate';
import type { Cents } from './money';
import type { Transaction } from './transaction';

export interface Budget {
  id: string;
  categoryId: string;
  limitCents: Cents;
}

export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface BudgetProgress {
  spentCents: Cents;
  ratio: number;
  status: BudgetStatus;
}

const WARNING_RATIO = 0.8;

function statusOf(ratio: number): BudgetStatus {
  if (ratio >= 1) return 'exceeded';
  return ratio >= WARNING_RATIO ? 'warning' : 'ok';
}

export function budgetProgress(budget: Budget, monthExpenses: Transaction[]): BudgetProgress {
  const spentCents = monthExpenses
    .filter((transaction) => transaction.categoryId === budget.categoryId)
    .reduce((total, transaction) => total + transaction.amountCents, 0);
  const ratio = spentCents / budget.limitCents;
  return { spentCents, ratio, status: statusOf(ratio) };
}

export function expensesOfMonth(
  transactions: Transaction[],
  projected: Transaction[],
  month: YearMonth,
): Transaction[] {
  return [...transactions, ...projected].filter(
    (transaction) => transaction.kind === 'expense' && yearMonthOf(transaction.date) === month,
  );
}
