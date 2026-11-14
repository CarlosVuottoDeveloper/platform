import { buildDataExport } from './dataExport';
import { tx } from './transaction.test-helpers';

const data = {
  accounts: [
    {
      id: 'a1',
      name: 'Nubank',
      type: 'bank' as const,
      color: 'viz-1',
      icon: 'landmark',
      initialBalanceCents: 100000,
      openingDate: '2026-01-01',
      archived: false,
    },
  ],
  categories: [
    {
      id: 'c1',
      name: 'Alimentação',
      kind: 'expense' as const,
      color: 'viz-5',
      icon: 'utensils',
      archived: false,
    },
  ],
  transactions: [tx({ id: 't1', amountCents: 1999, description: 'Padaria' })],
  recurrences: [
    {
      id: 'r1',
      kind: 'expense' as const,
      amountCents: 150000,
      dayOfMonth: 5,
      accountId: 'a1',
      categoryId: 'c1',
      description: 'Aluguel',
      tags: [],
      startMonth: '2026-01',
      endMonth: null,
      materializedThrough: '2026-03',
    },
  ],
  budgets: [{ id: 'c1', categoryId: 'c1', limitCents: 100000 }],
  goals: [
    {
      id: 'g1',
      name: 'Viagem',
      targetCents: 1000000,
      deadline: null,
      contributions: [{ id: 'k1', amountCents: 5000, date: '2026-03-01' }],
    },
  ],
};

describe('buildDataExport', () => {
  it('produces versioned, readable JSON with every collection and nested contributions', () => {
    const parsed = JSON.parse(buildDataExport(data, '2026-03-15'));

    expect(parsed).toEqual({ version: 1, exportedAt: '2026-03-15', ...data });
  });

  it('is indented for humans', () => {
    expect(buildDataExport(data, '2026-03-15')).toContain('\n  "version": 1');
  });

  it('carries no account identifier of the owner', () => {
    const json = buildDataExport(data, '2026-03-15');

    expect(json).not.toMatch(/uid|email/i);
  });
});
