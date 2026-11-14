import type { Account } from './account';
import { summarizeMonth } from './monthSummary';
import type { Recurrence } from './recurrence';
import { tx } from './transaction.test-helpers';

const base = {
  name: 'Conta',
  color: 'viz-1',
  icon: 'landmark',
  archived: false,
  type: 'bank',
} as const;
const main: Account = { ...base, id: 'a', initialBalanceCents: 0, openingDate: '2026-01-01' };
const savings: Account = { ...base, id: 'b', initialBalanceCents: 0, openingDate: '2026-01-01' };
const rent: Recurrence = {
  id: 'r1',
  kind: 'expense',
  amountCents: 50000,
  dayOfMonth: 25,
  accountId: 'a',
  categoryId: 'c1',
  description: 'Aluguel',
  tags: [],
  startMonth: '2026-01',
  endMonth: null,
  materializedThrough: '2026-02',
};
const transactions = [
  tx({ kind: 'income', amountCents: 115000, date: '2026-03-05', accountId: 'a' }),
  tx({ kind: 'expense', amountCents: 15000, date: '2026-03-12', accountId: 'a' }),
  tx({
    kind: 'transfer',
    amountCents: 10000,
    date: '2026-03-10',
    accountId: 'a',
    toAccountId: 'b',
  }),
  tx({ kind: 'expense', amountCents: 20000, date: '2026-03-20', accountId: 'a' }),
];
const input = { accounts: [main, savings], transactions, recurrences: [rent], today: '2026-03-15' };

describe('summarizeMonth', () => {
  it('summarises the current month up to today and projects its end', () => {
    expect(summarizeMonth({ ...input, month: '2026-03' })).toEqual({
      balanceCents: 100000,
      incomeCents: 115000,
      expenseCents: 15000,
      expectedEndBalanceCents: 30000,
    });
  });

  it('leaves transfers out of income and expenses', () => {
    const summary = summarizeMonth({
      ...input,
      transactions: [
        tx({
          kind: 'transfer',
          amountCents: 10000,
          date: '2026-03-10',
          accountId: 'a',
          toAccountId: 'b',
        }),
      ],
      recurrences: [],
      month: '2026-03',
    });

    expect(summary).toEqual({
      balanceCents: 0,
      incomeCents: 0,
      expenseCents: 0,
      expectedEndBalanceCents: 0,
    });
  });

  it('shows a past month as it closed, with everything realised', () => {
    const summary = summarizeMonth({
      ...input,
      transactions: [
        tx({ kind: 'income', amountCents: 80000, date: '2026-02-03', accountId: 'a' }),
        tx({ kind: 'expense', amountCents: 30000, date: '2026-02-27', accountId: 'a' }),
        ...transactions,
      ],
      month: '2026-02',
    });

    expect(summary).toEqual({
      balanceCents: 50000,
      incomeCents: 80000,
      expenseCents: 30000,
      expectedEndBalanceCents: 50000,
    });
  });

  it('treats a future month as forecast only, accumulating what is scheduled until its end', () => {
    expect(summarizeMonth({ ...input, month: '2026-04' })).toEqual({
      balanceCents: 100000,
      incomeCents: 0,
      expenseCents: 0,
      expectedEndBalanceCents: -20000,
    });
  });

  it('ignores archived accounts in balances but keeps their past income and expenses in the totals', () => {
    const archived: Account = {
      ...base,
      id: 'z',
      initialBalanceCents: 999,
      openingDate: '2026-01-01',
      archived: true,
    };
    const summary = summarizeMonth({
      accounts: [main, archived],
      transactions: [tx({ kind: 'expense', amountCents: 500, date: '2026-03-02', accountId: 'z' })],
      recurrences: [],
      month: '2026-03',
      today: '2026-03-15',
    });

    expect(summary).toEqual({
      balanceCents: 0,
      incomeCents: 0,
      expenseCents: 500,
      expectedEndBalanceCents: 0,
    });
  });
});
