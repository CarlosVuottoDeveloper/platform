import { budgetProgress, expensesOfMonth } from './budget';
import type { Budget } from './budget';
import { tx } from './transaction.test-helpers';

const budget: Budget = { id: 'c1', categoryId: 'c1', limitCents: 100000 };
const spent = (amountCents: number) => [tx({ kind: 'expense', amountCents, categoryId: 'c1' })];

describe('budget', () => {
  it.each([
    [0, 'ok', 0],
    [79999, 'ok', 0.79999],
    [80000, 'warning', 0.8],
    [99999, 'warning', 0.99999],
    [100000, 'exceeded', 1],
    [150000, 'exceeded', 1.5],
  ])('with %d spent of 100000 the status is %s', (amountCents, status, ratio) => {
    expect(budgetProgress(budget, amountCents === 0 ? [] : spent(amountCents))).toEqual({
      spentCents: amountCents,
      ratio,
      status,
    });
  });

  it('counts only the expenses of its own category', () => {
    const progress = budgetProgress(budget, [
      tx({ kind: 'expense', amountCents: 30000, categoryId: 'c1' }),
      tx({ kind: 'expense', amountCents: 50000, categoryId: 'c2' }),
      tx({ kind: 'expense', amountCents: 20000, categoryId: 'c1' }),
    ]);

    expect(progress.spentCents).toBe(50000);
  });

  it('gathers the expenses of a month, including upcoming and forecast ones, and nothing else', () => {
    const past = tx({ kind: 'expense', date: '2026-03-02' });
    const upcoming = tx({ kind: 'expense', date: '2026-03-28' });
    const forecast = tx({ kind: 'expense', date: '2026-03-25', id: 'r1_2026-03' });
    const income = tx({ kind: 'income', date: '2026-03-05' });
    const transfer = tx({ kind: 'transfer', date: '2026-03-06', toAccountId: 'b' });
    const otherMonth = tx({ kind: 'expense', date: '2026-04-01' });
    const forecastOtherMonth = tx({ kind: 'expense', date: '2026-04-25' });

    expect(
      expensesOfMonth(
        [past, upcoming, income, transfer, otherMonth],
        [forecast, forecastOtherMonth],
        '2026-03',
      ),
    ).toEqual([past, upcoming, forecast]);
  });
});
