import type { Transaction } from './transaction';

let sequence = 0;

export function tx(overrides: Partial<Transaction>): Transaction {
  sequence += 1;
  return {
    id: `t${sequence}`,
    kind: 'expense',
    amountCents: 1000,
    date: '2026-01-01',
    accountId: 'a',
    toAccountId: null,
    categoryId: overrides.kind === 'transfer' ? null : 'c1',
    description: '',
    tags: [],
    recurrenceId: null,
    installment: null,
    ...overrides,
  };
}
