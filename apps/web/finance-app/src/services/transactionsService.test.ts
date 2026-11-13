import { addDoc, collection, doc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';
import {
  createTransaction,
  createTransactions,
  deleteTransactions,
  subscribeToTransactions,
  updateTransaction,
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

const batch = { set: jest.fn(), delete: jest.fn(), commit: jest.fn() };

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

  it('creates several transactions atomically', async () => {
    await createTransactions('u1', [input, { ...input, date: '2026-04-05' }]);

    expect(batch.set).toHaveBeenCalledTimes(2);
    expect(batch.set).toHaveBeenLastCalledWith('generated-ref', {
      ...input,
      date: '2026-04-05',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    });
    expect(batch.commit).toHaveBeenCalledTimes(1);
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
});
