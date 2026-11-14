import { isLiability } from './account';
import type { Account } from './account';
import { accountBalanceOn } from './balance';
import { addMonths, lastDayOfMonth, monthsBetween, yearMonthOf } from './calendarDate';
import type { CalendarDate, YearMonth } from './calendarDate';
import type { Cents } from './money';
import type { Transaction } from './transaction';

const MAX_MONTHS = 12;

interface NetWorthEntry {
  month: YearMonth;
  assetsCents: Cents;
  liabilitiesCents: Cents;
  netCents: Cents;
}

const sum = (values: Cents[]) => values.reduce((total, value) => total + value, 0);

export function netWorthByMonth(
  accounts: Account[],
  transactions: Transaction[],
  today: CalendarDate,
): NetWorthEntry[] {
  if (accounts.length === 0) return [];

  const currentMonth = yearMonthOf(today);
  const oldestMonth = accounts
    .map((account) => yearMonthOf(account.openingDate))
    .reduce((oldest, month) => (month < oldest ? month : oldest));
  const windowStart = addMonths(currentMonth, 1 - MAX_MONTHS);
  const firstMonth = oldestMonth > windowStart ? oldestMonth : windowStart;

  return monthsBetween(firstMonth, currentMonth).map((month) => {
    const monthEnd = lastDayOfMonth(month);
    const asOf = monthEnd < today ? monthEnd : today;
    const balanceOf = (account: Account) => accountBalanceOn(account, transactions, asOf);
    const assetsCents = sum(
      accounts.filter((account) => !isLiability(account.type)).map(balanceOf),
    );
    const owedCents = sum(accounts.filter((account) => isLiability(account.type)).map(balanceOf));
    return {
      month,
      assetsCents,
      liabilitiesCents: owedCents === 0 ? 0 : -owedCents,
      netCents: assetsCents + owedCents,
    };
  });
}
