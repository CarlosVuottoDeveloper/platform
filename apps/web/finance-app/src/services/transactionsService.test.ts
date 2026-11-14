import { addDoc, collection, doc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';
import {
  createInstallments,
  createTransaction,
  deleteTransactions,
  subscribeToTransactions,
  updateTransaction,
  updateTransactions,
} from './transactionsService';

jest.mock('./firebase', () => ({ db: { name: 'db' } }));

const input = {
  kind: 'expense' as const,
  amountCents: 1999,
  date: '2026-03-05',
  accountId: 'a1',
  toAccountId: null,
  categoryId: 'c1',
  description: 'Mercado',
  tags: ['casa'],
  recurrenceId: null,
  installment: null,
};

const batch = { set: jest.fn(), update: jest.fn(), delete: jest.fn(), commit: jest.fn() };

describe('transactionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(collection).mockReturnValue('transactions-ref' as never);
    jest
      .mocked(doc)
      .mockImplementation(((...segments: unknown[]) =>
        segments.length === 1
          ? 'generated-ref'
          : `ref:${String(segments[segments.length - 1])}`) as never);
    jest.mocked(writeBatch).mockReturnValue(batch as never);
    batch.commit.mockResolvedValue(undefined);
  });

  it('publishes the transactions stored under the user, without timestamps', () => {
    jest.mocked(onSnapshot).mockImplementation(((
      _ref: unknown,
      next: (snapshot: unknown) => void,
    ) => {
      next({ docs: [{ id: 't1', data: () => ({ ...input, createdAt: 'c', updatedAt: 'u' }) }] });
      return jest.fn();
    }) as never);
    const onChange = jest.fn();

    subscribeToTransactions('u1', onChange, jest.fn());

    expect(collection).toHaveBeenCalledWith({ name: 'db' }, 'users', 'u1', 'transactions');
    expect(onChange).toHaveBeenCalledWith([{ id: 't1', ...input }]);
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

    subscribeToTransactions('u1', jest.fn(), onError);

    expect(onError).toHaveBeenCalledWith('unavailable');
  });

  it('creates one transaction stamped by the server', async () => {
    jest.mocked(addDoc).mockResolvedValue({ id: 'new-id' } as never);

    await expect(createTransaction('u1', input)).resolves.toBe('new-id');

    expect(addDoc).toHaveBeenCalledWith('transactions-ref', {
      ...input,
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    });
  });

  it('updates a transaction and refreshes its update time', async () => {
    await updateTransaction('u1', 't1', input);

    expect(doc).toHaveBeenCalledWith({ name: 'db' }, 'users', 'u1', 'transactions', 't1');
    expect(updateDoc).toHaveBeenCalledWith('ref:t1', { ...input, updatedAt: 'SERVER_TIMESTAMP' });
  });

  it('deletes several transactions atomically', async () => {
    await deleteTransactions('u1', ['t1', 't2']);

    expect(batch.delete).toHaveBeenCalledWith('ref:t1');
    expect(batch.delete).toHaveBeenCalledWith('ref:t2');
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  it('creates an instalment purchase as one movement per month sharing a group id', async () => {
    jest
      .mocked(doc)
      .mockImplementation(((...segments: unknown[]) =>
        segments.length === 1
          ? { id: 'generated-id' }
          : `ref:${String(segments[segments.length - 1])}`) as never);

    await createInstallments('u1', { ...input, amountCents: 10000, date: '2026-01-31' }, 3);

    expect(batch.set).toHaveBeenCalledTimes(3);
    expect(
      batch.set.mock.calls.map(([, data]) => [data.date, data.amountCents, data.installment]),
    ).toEqual([
      ['2026-01-31', 3334, { groupId: 'generated-id', index: 1, count: 3 }],
      ['2026-02-28', 3333, { groupId: 'generated-id', index: 2, count: 3 }],
      ['2026-03-31', 3333, { groupId: 'generated-id', index: 3, count: 3 }],
    ]);
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  it('updates several transactions atomically', async () => {
    await updateTransactions('u1', [
      { id: 't1', input },
      { id: 't2', input: { ...input, date: '2026-04-05' } },
    ]);

    expect(batch.update).toHaveBeenCalledWith('ref:t1', {
      ...input,
      updatedAt: 'SERVER_TIMESTAMP',
    });
    expect(batch.update).toHaveBeenCalledWith('ref:t2', {
      ...input,
      date: '2026-04-05',
      updatedAt: 'SERVER_TIMESTAMP',
    });
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });
});
