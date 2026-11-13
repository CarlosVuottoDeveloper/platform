import { collection, getDocs } from 'firebase/firestore';
import { downloadJson } from './exportService';
import { eraseUserTree } from './userDataEraser';
import { deleteAllUserData, downloadAllData } from './userDataService';

jest.mock('./firebase', () => ({ db: { name: 'db' } }));
jest.mock('./exportService');
jest.mock('./userDataEraser');

const documentsByPath: Record<string, { id: string; data: () => Record<string, unknown> }[]> = {
  'users/u1/accounts': [{ id: 'a1', data: () => ({ name: 'Nubank', createdAt: 'ts' }) }],
  'users/u1/categories': [{ id: 'c1', data: () => ({ name: 'Alimentação' }) }],
  'users/u1/transactions': [
    { id: 't1', data: () => ({ amountCents: 1999, createdAt: 'c', updatedAt: 'u' }) },
  ],
  'users/u1/recurrences': [],
  'users/u1/budgets': [{ id: 'c1', data: () => ({ categoryId: 'c1', limitCents: 100000 }) }],
  'users/u1/goals': [{ id: 'g1', data: () => ({ name: 'Viagem' }) }],
  'users/u1/goals/g1/contributions': [
    { id: 'k1', data: () => ({ amountCents: 5000, date: '2026-03-01' }) },
  ],
};

describe('userDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    jest
      .mocked(collection)
      .mockImplementation(((...segments: unknown[]) => segments.slice(1).join('/')) as never);
    jest.mocked(getDocs).mockImplementation((async (path: string) => ({
      docs: documentsByPath[path] ?? [],
    })) as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('downloads everything the user stored, without storage timestamps, in a dated file', async () => {
    await downloadAllData('u1');

    const [json, filename] = jest.mocked(downloadJson).mock.calls[0] as [string, string];
    expect(filename).toBe('financas-2026-03-15.json');
    expect(JSON.parse(json)).toEqual({
      version: 1,
      exportedAt: '2026-03-15',
      accounts: [{ id: 'a1', name: 'Nubank' }],
      categories: [{ id: 'c1', name: 'Alimentação' }],
      transactions: [{ id: 't1', amountCents: 1999 }],
      recurrences: [],
      budgets: [{ id: 'c1', categoryId: 'c1', limitCents: 100000 }],
      goals: [
        {
          id: 'g1',
          name: 'Viagem',
          contributions: [{ id: 'k1', amountCents: 5000, date: '2026-03-01' }],
        },
      ],
    });
  });

  it('erases the whole tree of the user', async () => {
    await deleteAllUserData('u1');

    expect(eraseUserTree).toHaveBeenCalledWith({ name: 'db' }, 'u1');
  });
});
