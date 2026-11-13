import { dueOccurrences, occurrenceId, projectedOccurrences } from './recurrence';
import type { Recurrence } from './recurrence';

const recurrence = (overrides: Partial<Recurrence>): Recurrence => ({
  id: 'r1',
  kind: 'expense',
  amountCents: 150000,
  dayOfMonth: 5,
  accountId: 'a1',
  categoryId: 'c1',
  description: 'Aluguel',
  tags: ['casa'],
  startMonth: '2026-01',
  endMonth: null,
  materializedThrough: null,
  ...overrides,
});

const rent = recurrence({ dayOfMonth: 31 });

describe('recurrence', () => {
  it('derives a stable id per recurrence and month', () => {
    expect(occurrenceId('r1', '2026-03')).toBe('r1_2026-03');
  });

  it('lists every occurrence due up to today, clamping the day in short months', () => {
    expect(dueOccurrences(rent, '2026-03-15').map((occurrence) => occurrence.input.date)).toEqual([
      '2026-01-31',
      '2026-02-28',
    ]);
  });

  it('skips what was already materialised', () => {
    expect(dueOccurrences({ ...rent, materializedThrough: '2026-02' }, '2026-03-15')).toEqual([]);
    expect(
      dueOccurrences({ ...rent, materializedThrough: '2026-02' }, '2026-03-31').map(
        (occurrence) => occurrence.id,
      ),
    ).toEqual(['r1_2026-03']);
  });

  it('stops at the end month', () => {
    expect(
      dueOccurrences({ ...rent, endMonth: '2026-01' }, '2026-03-31').map(
        (occurrence) => occurrence.month,
      ),
    ).toEqual(['2026-01']);
  });

  it('has nothing due before the start month', () => {
    expect(dueOccurrences(recurrence({ startMonth: '2026-06' }), '2026-03-31')).toEqual([]);
  });

  it('builds each occurrence as a regular movement linked to its rule', () => {
    const [occurrence] = dueOccurrences(recurrence({}), '2026-01-05');

    expect(occurrence).toEqual({
      id: 'r1_2026-01',
      month: '2026-01',
      input: {
        kind: 'expense',
        amountCents: 150000,
        date: '2026-01-05',
        accountId: 'a1',
        toAccountId: null,
        categoryId: 'c1',
        description: 'Aluguel',
        tags: ['casa'],
        recurrenceId: 'r1',
        installment: null,
      },
    });
  });

  it('projects the occurrences still to come inside a window', () => {
    expect(
      projectedOccurrences(
        [{ ...rent, materializedThrough: '2026-02' }],
        '2026-03-15',
        '2026-03-31',
      ).map((projected) => projected.date),
    ).toEqual(['2026-03-31']);
  });

  it('projects across months with stable ids and respects the end month', () => {
    const projected = projectedOccurrences(
      [recurrence({ materializedThrough: '2026-03', endMonth: '2026-05' })],
      '2026-03-15',
      '2026-07-31',
    );

    expect(projected.map((item) => [item.id, item.date])).toEqual([
      ['r1_2026-04', '2026-04-05'],
      ['r1_2026-05', '2026-05-05'],
    ]);
    expect(projected[0]?.recurrenceId).toBe('r1');
  });

  it('does not project what is already due or already materialised', () => {
    expect(projectedOccurrences([recurrence({})], '2026-03-15', '2026-03-31')).toEqual([]);
    expect(
      projectedOccurrences(
        [recurrence({ dayOfMonth: 20, materializedThrough: '2026-03' })],
        '2026-03-15',
        '2026-03-31',
      ),
    ).toEqual([]);
  });
});
