import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import type { Recurrence } from '../domain/recurrence';
import {
  createRecurrence,
  deleteRecurrence,
  materializeDueRecurrences,
  subscribeToRecurrences,
  updateRecurrence,
} from './recurrencesService';

jest.mock('./firebase', () => ({ db: { name: 'db' } }));

const input = {
  kind: 'expense' as const,
  amountCents: 150000,
  dayOfMonth: 5,
  accountId: 'a1',
  categoryId: 'c1',
  description: 'Aluguel',
  tags: [],
  startMonth: '2026-01',
  endMonth: null,
};
const stored = (overrides: Partial<Recurrence>): Recurrence => ({
  id: 'r1',
  ...input,
  materializedThrough: null,
  ...overrides,
});

describe('recurrencesService', () => {
  const transaction = { get: jest.fn(), set: jest.fn(), update: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(collection).mockReturnValue('recurrences-ref' as never);
    jest
      .mocked(doc)
      .mockImplementation(
        ((...segments: unknown[]) => `ref:${segments.slice(1).join('/')}`) as never,
      );
    jest
      .mocked(runTransaction)
      .mockImplementation(((_db: unknown, run: (t: typeof transaction) => Promise<void>) =>
        run(transaction)) as never);
  });

  it('publishes the recurrences stored under the user', () => {
    jest.mocked(onSnapshot).mockImplementation(((
      _ref: unknown,
      next: (snapshot: unknown) => void,
    ) => {
      next({ docs: [{ id: 'r1', data: () => ({ ...input, materializedThrough: '2026-02' }) }] });
      return jest.fn();
    }) as never);
    const onChange = jest.fn();

    subscribeToRecurrences('u1', onChange, jest.fn());

    expect(collection).toHaveBeenCalledWith({ name: 'db' }, 'users', 'u1', 'recurrences');
    expect(onChange).toHaveBeenCalledWith([stored({ materializedThrough: '2026-02' })]);
  });

  it('reports only the error code when the subscription fails', () => {
    jest.mocked(onSnapshot).mockImplementation(((
      _ref: unknown,
      _next: unknown,
      onError: (error: unknown) => void,
    ) => {
      onError({ code: 'unavailable' });
      return jest.fn();
    }) as never);
    const onError = jest.fn();

    subscribeToRecurrences('u1', jest.fn(), onError);

    expect(onError).toHaveBeenCalledWith('unavailable');
  });

  it('creates a rule that has materialised nothing yet', async () => {
    jest.mocked(addDoc).mockResolvedValue({ id: 'new-id' } as never);

    await expect(createRecurrence('u1', input)).resolves.toBe('new-id');

    expect(addDoc).toHaveBeenCalledWith('recurrences-ref', { ...input, materializedThrough: null });
  });

  it('updates a rule without touching what was already materialised', async () => {
    await updateRecurrence('u1', 'r1', input);

    expect(updateDoc).toHaveBeenCalledWith('ref:users/u1/recurrences/r1', input);
  });

  it('deletes a rule', async () => {
    await deleteRecurrence('u1', 'r1');

    expect(deleteDoc).toHaveBeenCalledWith('ref:users/u1/recurrences/r1');
  });

  describe('materialising due occurrences', () => {
    it('creates each due occurrence under a deterministic id and advances the rule', async () => {
      transaction.get.mockResolvedValue({
        exists: () => true,
        id: 'r1',
        data: () => ({ ...input, materializedThrough: null }),
      });

      await materializeDueRecurrences('u1', [stored({})], '2026-02-10');

      expect(transaction.set.mock.calls.map(([ref, data]) => [ref, data.date])).toEqual([
        ['ref:users/u1/transactions/r1_2026-01', '2026-01-05'],
        ['ref:users/u1/transactions/r1_2026-02', '2026-02-05'],
      ]);
      expect(transaction.set.mock.calls[0]?.[1]).toMatchObject({
        recurrenceId: 'r1',
        amountCents: 150000,
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      });
      expect(transaction.update).toHaveBeenCalledWith('ref:users/u1/recurrences/r1', {
        materializedThrough: '2026-02',
      });
    });

    it('recomputes from the stored rule, so a second tab that is behind creates nothing', async () => {
      transaction.get.mockResolvedValue({
        exists: () => true,
        id: 'r1',
        data: () => ({ ...input, materializedThrough: '2026-02' }),
      });

      await materializeDueRecurrences('u1', [stored({ materializedThrough: null })], '2026-02-10');

      expect(transaction.set).not.toHaveBeenCalled();
      expect(transaction.update).not.toHaveBeenCalled();
    });

    it('opens no transaction for rules with nothing due', async () => {
      await materializeDueRecurrences(
        'u1',
        [stored({ materializedThrough: '2026-02' })],
        '2026-02-10',
      );

      expect(runTransaction).not.toHaveBeenCalled();
    });

    it('keeps going when one rule loses the race to another tab', async () => {
      transaction.get.mockRejectedValueOnce({ code: 'permission-denied' }).mockResolvedValueOnce({
        exists: () => true,
        id: 'r2',
        data: () => ({ ...input, materializedThrough: null }),
      });

      await expect(
        materializeDueRecurrences('u1', [stored({ id: 'r1' }), stored({ id: 'r2' })], '2026-01-10'),
      ).resolves.toBeUndefined();

      expect(transaction.update).toHaveBeenCalledWith('ref:users/u1/recurrences/r2', {
        materializedThrough: '2026-01',
      });
    });

    it('does nothing when the rule was deleted meanwhile', async () => {
      transaction.get.mockResolvedValue({ exists: () => false });

      await materializeDueRecurrences('u1', [stored({})], '2026-02-10');

      expect(transaction.set).not.toHaveBeenCalled();
    });
  });
});
