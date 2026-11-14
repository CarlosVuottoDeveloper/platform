import type { Account } from './account';
import type { Category } from './category';
import {
  dailyConsolidatedBalance,
  expensesByCategory,
  monthlyCashFlow,
  totalSpent,
} from './charts';
import { tx } from './transaction.test-helpers';

const categories = [
  { id: 'c1', name: 'Alimentação', kind: 'expense', color: 'viz-5', archived: false },
  { id: 'c2', name: 'Moradia', kind: 'expense', color: 'viz-1', archived: true },
] as Category[];
const account: Account = {
  id: 'a',
  name: 'Conta',
  type: 'bank',
  color: 'viz-1',
  icon: 'landmark',
  initialBalanceCents: 100000,
  openingDate: '2026-01-01',
  archived: false,
};

describe('expensesByCategory', () => {
  const transactions = [
    tx({ kind: 'expense', amountCents: 30000, date: '2026-03-02', categoryId: 'c1' }),
    tx({ kind: 'expense', amountCents: 150000, date: '2026-03-05', categoryId: 'c2' }),
    tx({ kind: 'expense', amountCents: 20000, date: '2026-03-31', categoryId: 'c1' }),
    tx({ kind: 'expense', amountCents: 99999, date: '2026-04-01', categoryId: 'c1' }),
    tx({ kind: 'income', amountCents: 500000, date: '2026-03-05', categoryId: 'c9' }),
    tx({ kind: 'transfer', amountCents: 70000, date: '2026-03-06', toAccountId: 'b' }),
  ];

  it('totals expenses per category inside the period, largest first, archived included', () => {
    expect(expensesByCategory(transactions, categories, '2026-03-01', '2026-03-31')).toEqual([
      { categoryId: 'c2', label: 'Moradia', color: 'var(--viz-1)', totalCents: 150000 },
      { categoryId: 'c1', label: 'Alimentação', color: 'var(--viz-5)', totalCents: 50000 },
    ]);
  });

  it('labels expenses of an unknown category instead of dropping them', () => {
    const [slice] = expensesByCategory(
      [tx({ kind: 'expense', amountCents: 100, date: '2026-03-02', categoryId: 'gone' })],
      categories,
      '2026-03-01',
      '2026-03-31',
    );

    expect(slice).toEqual({
      categoryId: 'gone',
      label: 'Sem categoria',
      color: 'var(--viz-6)',
      totalCents: 100,
    });
  });

  it('is empty when nothing was spent', () => {
    expect(expensesByCategory([], categories, '2026-03-01', '2026-03-31')).toEqual([]);
  });
});

describe('monthlyCashFlow', () => {
  it('totals realised income and expenses per month, zero-filling quiet months', () => {
    const transactions = [
      tx({ kind: 'income', amountCents: 500000, date: '2026-01-05' }),
      tx({ kind: 'expense', amountCents: 120000, date: '2026-01-20' }),
      tx({ kind: 'expense', amountCents: 80000, date: '2026-03-10' }),
      tx({ kind: 'expense', amountCents: 40000, date: '2026-03-28' }),
      tx({ kind: 'transfer', amountCents: 90000, date: '2026-03-02', toAccountId: 'b' }),
    ];

    expect(monthlyCashFlow(transactions, ['2026-01', '2026-02', '2026-03'], '2026-03-15')).toEqual([
      { month: '2026-01', incomeCents: 500000, expenseCents: 120000 },
      { month: '2026-02', incomeCents: 0, expenseCents: 0 },
      { month: '2026-03', incomeCents: 0, expenseCents: 80000 },
    ]);
  });
});

describe('dailyConsolidatedBalance', () => {
  const transactions = [
    tx({ kind: 'expense', amountCents: 10000, date: '2026-02-03', accountId: 'a' }),
    tx({ kind: 'income', amountCents: 50000, date: '2026-02-10', accountId: 'a' }),
  ];

  it('gives one point per day of a past month', () => {
    const points = dailyConsolidatedBalance([account], transactions, '2026-02', '2026-03-15');

    expect(points).toHaveLength(28);
    expect(points[0]).toEqual({ date: '2026-02-01', balanceCents: 100000 });
    expect(points[2]).toEqual({ date: '2026-02-03', balanceCents: 90000 });
    expect(points[27]).toEqual({ date: '2026-02-28', balanceCents: 140000 });
  });

  it('stops at today in the current month', () => {
    const points = dailyConsolidatedBalance([account], transactions, '2026-03', '2026-03-15');

    expect(points).toHaveLength(15);
    expect(points[14]?.date).toBe('2026-03-15');
  });

  it('is empty for a future month', () => {
    expect(dailyConsolidatedBalance([account], transactions, '2026-04', '2026-03-15')).toEqual([]);
  });
});

describe('totalSpent', () => {
  it('adds up the spending of every category', () => {
    const entry = { categoryId: 'c', label: 'x', color: 'var(--viz-1)' };
    expect(
      totalSpent([
        { ...entry, totalCents: 100 },
        { ...entry, totalCents: 250 },
      ]),
    ).toBe(350);
  });

  it('is zero without spending', () => {
    expect(totalSpent([])).toBe(0);
  });
});
