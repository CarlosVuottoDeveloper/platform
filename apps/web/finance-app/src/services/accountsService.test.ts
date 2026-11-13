import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import {
  createAccount,
  deleteAccount,
  setAccountArchived,
  subscribeToAccounts,
  updateAccount,
} from './accountsService';

jest.mock('./firebase', () => ({ db: { name: 'db' } }));

const input = {
  name: 'Nubank',
  type: 'bank' as const,
  color: 'viz-1',
  icon: 'landmark',
  initialBalanceCents: 100000,
  openingDate: '2026-01-01',
};

describe('accountsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(collection).mockReturnValue('accounts-ref' as never);
    jest.mocked(doc).mockReturnValue('account-ref' as never);
  });

  it('publishes the accounts stored under the user, without storage-only fields', () => {
    const unsubscribe = jest.fn();
    jest.mocked(onSnapshot).mockImplementation(((
      _ref: unknown,
      next: (snapshot: unknown) => void,
    ) => {
      next({
        docs: [{ id: 'a1', data: () => ({ ...input, archived: false, createdAt: 'ts' }) }],
      });
      return unsubscribe;
    }) as never);
    const onChange = jest.fn();

    const result = subscribeToAccounts('u1', onChange, jest.fn());

    expect(collection).toHaveBeenCalledWith({ name: 'db' }, 'users', 'u1', 'accounts');
    expect(onChange).toHaveBeenCalledWith([{ id: 'a1', ...input, archived: false }]);
    expect(result).toBe(unsubscribe);
  });

  it('reports only the error code when the subscription fails', () => {
    jest.mocked(onSnapshot).mockImplementation(((
      _ref: unknown,
      _next: unknown,
      onError: (error: unknown) => void,
    ) => {
      onError({ code: 'permission-denied', message: 'details' });
      return jest.fn();
    }) as never);
    const onError = jest.fn();

    subscribeToAccounts('u1', jest.fn(), onError);

    expect(onError).toHaveBeenCalledWith('permission-denied');
  });

  it('creates an active account stamped by the server', async () => {
    jest.mocked(addDoc).mockResolvedValue({ id: 'new-id' } as never);

    await expect(createAccount('u1', input)).resolves.toBe('new-id');

    expect(addDoc).toHaveBeenCalledWith('accounts-ref', {
      ...input,
      archived: false,
      createdAt: 'SERVER_TIMESTAMP',
    });
  });

  it('updates the editable fields of an account', async () => {
    await updateAccount('u1', 'a1', input);

    expect(doc).toHaveBeenCalledWith({ name: 'db' }, 'users', 'u1', 'accounts', 'a1');
    expect(updateDoc).toHaveBeenCalledWith('account-ref', input);
  });

  it('archives and unarchives an account', async () => {
    await setAccountArchived('u1', 'a1', true);

    expect(updateDoc).toHaveBeenCalledWith('account-ref', { archived: true });
  });

  it('deletes an account', async () => {
    await deleteAccount('u1', 'a1');

    expect(deleteDoc).toHaveBeenCalledWith('account-ref');
  });
});
