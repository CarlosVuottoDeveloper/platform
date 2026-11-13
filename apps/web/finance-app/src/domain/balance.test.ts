import type { Account } from './account';
import {
  accountBalanceOn,
  accountHasTransactions,
  consolidatedBalanceOn,
  earliestTransactionDate,
  pendingTotalAfter,
} from './balance';
import { tx } from './transaction.test-helpers';

const base = { name: 'Conta', color: 'viz-1', icon: 'landmark', archived: false } as const;
const account: Account = {
  ...base,
  id: 'a',
  type: 'bank',
  initialBalanceCents: 100000,
  openingDate: '2026-01-01',
};
const other: Account = {
  ...base,
  id: 'b',
  type: 'bank',
  initialBalanceCents: 0,
  openingDate: '2026-01-01',
};
const list = [
  tx({ kind: 'income', amountCents: 50000, date: '2026-01-10', accountId: 'a' }),
  tx({ kind: 'expense', amountCents: 20000, date: '2026-01-15', accountId: 'a' }),
  tx({
    kind: 'transfer',
    amountCents: 30000,
    date: '2026-01-20',
    accountId: 'a',
    toAccountId: 'b',
  }),
  tx({ kind: 'expense', amountCents: 10000, date: '2026-02-05', accountId: 'a' }),
];

describe('balance', () => {
  it('is zero before the account opens', () => {
    expect(accountBalanceOn(account, list, '2025-12-31')).toBe(0);
  });

  it('counts the opening balance from the opening date', () => {
    expect(accountBalanceOn(account, [], '2026-01-01')).toBe(100000);
  });

  it('adds income, subtracts expenses and moves transfers up to the date', () => {
    expect(accountBalanceOn(account, list, '2026-01-31')).toBe(100000);
    expect(accountBalanceOn(account, list, '2026-02-05')).toBe(90000);
    expect(accountBalanceOn(other, list, '2026-01-31')).toBe(30000);
  });

  it('ignores movements of other accounts', () => {
    expect(accountBalanceOn(other, list, '2026-01-19')).toBe(0);
  });

  it('consolidates active accounts only, and transfers cancel out', () => {
    expect(consolidatedBalanceOn([account, other], list, '2026-01-31')).toBe(130000);
    expect(consolidatedBalanceOn([account, { ...other, archived: true }], list, '2026-01-31')).toBe(
      100000,
    );
  });

  it('totals what is still to come after the date', () => {
    expect(pendingTotalAfter(account, list, '2026-01-31')).toBe(-10000);
    expect(pendingTotalAfter(account, list, '2026-02-05')).toBe(0);
    expect(pendingTotalAfter(other, list, '2026-01-01')).toBe(30000);
  });

  it('knows whether an account has movements, as origin or destination', () => {
    expect(accountHasTransactions('a', list)).toBe(true);
    expect(accountHasTransactions('b', list)).toBe(true);
    expect(accountHasTransactions('z', list)).toBe(false);
  });

  it('finds the earliest movement of an account, as origin or destination', () => {
    expect(earliestTransactionDate('a', list)).toBe('2026-01-10');
    expect(earliestTransactionDate('b', list)).toBe('2026-01-20');
    expect(earliestTransactionDate('z', list)).toBeNull();
  });
});
