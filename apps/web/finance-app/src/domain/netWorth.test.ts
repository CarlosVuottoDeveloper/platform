import type { Account } from './account';
import { netWorthByMonth } from './netWorth';
import { tx } from './transaction.test-helpers';

const base = { name: 'Conta', color: 'viz-1', icon: 'landmark', archived: false } as const;
const bank: Account = {
  ...base,
  id: 'a',
  type: 'bank',
  initialBalanceCents: 100000,
  openingDate: '2026-01-10',
};
const card: Account = {
  ...base,
  id: 'c',
  type: 'credit_card',
  initialBalanceCents: 0,
  openingDate: '2026-02-01',
};

describe('netWorthByMonth', () => {
  it('is empty without accounts', () => {
    expect(netWorthByMonth([], [], '2026-03-15')).toEqual([]);
  });

  it('starts at the month of the oldest account and ends at the current month', () => {
    const months = netWorthByMonth([bank, card], [], '2026-03-15').map((entry) => entry.month);

    expect(months).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('covers at most the last twelve months', () => {
    const old: Account = { ...bank, openingDate: '2020-01-01' };

    const months = netWorthByMonth([old], [], '2026-03-15').map((entry) => entry.month);

    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2025-04');
    expect(months[11]).toBe('2026-03');
  });

  it('separates assets from liabilities at each month end, using today for the current month', () => {
    const transactions = [
      tx({ kind: 'expense', amountCents: 50000, date: '2026-02-20', accountId: 'c' }),
      tx({ kind: 'income', amountCents: 30000, date: '2026-03-10', accountId: 'a' }),
      tx({ kind: 'income', amountCents: 99999, date: '2026-03-20', accountId: 'a' }),
    ];

    expect(netWorthByMonth([bank, card], transactions, '2026-03-15')).toEqual([
      { month: '2026-01', assetsCents: 100000, liabilitiesCents: 0, netCents: 100000 },
      { month: '2026-02', assetsCents: 100000, liabilitiesCents: 50000, netCents: 50000 },
      { month: '2026-03', assetsCents: 130000, liabilitiesCents: 50000, netCents: 80000 },
    ]);
  });

  it('keeps archived accounts in the history', () => {
    const archived: Account = { ...bank, id: 'z', archived: true, initialBalanceCents: 20000 };

    const [first] = netWorthByMonth([archived], [], '2026-01-31');

    expect(first).toEqual({
      month: '2026-01',
      assetsCents: 20000,
      liabilitiesCents: 0,
      netCents: 20000,
    });
  });

  it('counts an overdrawn asset account as a negative asset and an overpaid card as a negative liability', () => {
    const transactions = [
      tx({ kind: 'expense', amountCents: 150000, date: '2026-02-05', accountId: 'a' }),
      tx({ kind: 'income', amountCents: 10000, date: '2026-02-06', accountId: 'c' }),
    ];

    const february = netWorthByMonth([bank, card], transactions, '2026-02-28')[1];

    expect(february).toEqual({
      month: '2026-02',
      assetsCents: -50000,
      liabilitiesCents: -10000,
      netCents: -40000,
    });
  });
});
