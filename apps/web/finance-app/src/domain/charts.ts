import type { Account } from './account';
import { colorVariable } from './appearance';
import { consolidatedBalanceOn } from './balance';
import { dateInMonth, lastDayOfMonth, yearMonthOf } from './calendarDate';
import type { CalendarDate, YearMonth } from './calendarDate';
import type { Category } from './category';
import type { Cents } from './money';
import type { Transaction, TransactionKind } from './transaction';
import { categoryName } from './transactionList';

const UNKNOWN_CATEGORY_COLOR = 'viz-6';

interface CategoryExpense {
  categoryId: string | null;
  label: string;
  color: string;
  totalCents: Cents;
}

export function expensesByCategory(
  transactions: Transaction[],
  categories: Category[],
  from: CalendarDate,
  to: CalendarDate,
): CategoryExpense[] {
  const totals = new Map<string | null, Cents>();
  transactions
    .filter(
      (transaction) =>
        transaction.kind === 'expense' && transaction.date >= from && transaction.date <= to,
    )
    .forEach((transaction) => {
      const previous = totals.get(transaction.categoryId) ?? 0;
      totals.set(transaction.categoryId, previous + transaction.amountCents);
    });

  return [...totals.entries()]
    .map(([categoryId, totalCents]) => {
      const category = categories.find((candidate) => candidate.id === categoryId);
      return {
        categoryId,
        label: categoryName(categories, categoryId),
        color: colorVariable(category?.color ?? UNKNOWN_CATEGORY_COLOR),
        totalCents,
      };
    })
    .sort((a, b) => b.totalCents - a.totalCents);
}

function totalOf(transactions: Transaction[], kind: TransactionKind): Cents {
  return transactions
    .filter((transaction) => transaction.kind === kind)
    .reduce((total, transaction) => total + transaction.amountCents, 0);
}

export function monthlyCashFlow(
  transactions: Transaction[],
  months: YearMonth[],
  today: CalendarDate,
): { month: YearMonth; incomeCents: Cents; expenseCents: Cents }[] {
  const realised = transactions.filter((transaction) => transaction.date <= today);
  return months.map((month) => {
    const ofMonth = realised.filter((transaction) => yearMonthOf(transaction.date) === month);
    return {
      month,
      incomeCents: totalOf(ofMonth, 'income'),
      expenseCents: totalOf(ofMonth, 'expense'),
    };
  });
}

export function dailyConsolidatedBalance(
  accounts: Account[],
  transactions: Transaction[],
  month: YearMonth,
  today: CalendarDate,
): { date: CalendarDate; balanceCents: Cents }[] {
  const monthEnd = lastDayOfMonth(month);
  const lastDay = Number((monthEnd < today ? monthEnd : today).slice(8));
  if (yearMonthOf(today) < month) return [];
  return Array.from({ length: lastDay }, (_, index) => {
    const date = dateInMonth(month, index + 1);
    return { date, balanceCents: consolidatedBalanceOn(accounts, transactions, date) };
  });
}
