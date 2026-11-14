import { buildInstallments, installmentsFrom, splitInstallments } from './installment';
import { tx } from './transaction.test-helpers';
import type { TransactionInput } from './transaction';

const draft: TransactionInput = {
  kind: 'expense',
  amountCents: 10000,
  date: '2026-01-31',
  accountId: 'a1',
  toAccountId: null,
  categoryId: 'c1',
  description: 'Notebook',
  tags: ['trabalho'],
  recurrenceId: null,
  installment: null,
};

describe('installment', () => {
  it('splits the total in cents and puts the remainder on the first instalment', () => {
    expect(splitInstallments(10000, 3)).toEqual([3334, 3333, 3333]);
    expect(splitInstallments(9999, 1)).toEqual([9999]);
    expect(splitInstallments(100, 3)).toEqual([34, 33, 33]);
    expect(splitInstallments(10, 4)).toEqual([4, 2, 2, 2]);
  });

  it('never loses or creates a cent', () => {
    const parts = splitInstallments(123457, 7);

    expect(parts.reduce((total, part) => total + part, 0)).toBe(123457);
  });

  it('builds one movement per month, clamping the day in short months', () => {
    const built = buildInstallments(draft, 3, 'g1');

    expect(built.map((item) => item.date)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31']);
    expect(built.map((item) => item.amountCents)).toEqual([3334, 3333, 3333]);
    expect(built.map((item) => item.installment)).toEqual([
      { groupId: 'g1', index: 1, count: 3 },
      { groupId: 'g1', index: 2, count: 3 },
      { groupId: 'g1', index: 3, count: 3 },
    ]);
    expect(built.every((item) => item.description === 'Notebook' && item.accountId === 'a1')).toBe(
      true,
    );
  });

  it('crosses the year boundary', () => {
    const built = buildInstallments({ ...draft, date: '2026-11-15' }, 3, 'g1');

    expect(built.map((item) => item.date)).toEqual(['2026-11-15', '2026-12-15', '2027-01-15']);
  });

  it('finds an instalment and the ones after it in the same purchase', () => {
    const first = tx({ id: 'i1', installment: { groupId: 'g1', index: 1, count: 3 } });
    const second = tx({ id: 'i2', installment: { groupId: 'g1', index: 2, count: 3 } });
    const third = tx({ id: 'i3', installment: { groupId: 'g1', index: 3, count: 3 } });
    const other = tx({ id: 'o1', installment: { groupId: 'g2', index: 2, count: 2 } });
    const plain = tx({ id: 'p1' });

    expect(installmentsFrom([third, plain, first, other, second], 'g1', 2)).toEqual([
      second,
      third,
    ]);
  });
});
