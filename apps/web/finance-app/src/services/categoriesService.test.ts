import { addDoc, collection, doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../domain/category';
import {
  createCategory,
  seedDefaultCategories,
  setCategoryArchived,
  subscribeToCategories,
  updateCategory,
} from './categoriesService';

jest.mock('./firebase', () => ({ db: { name: 'db' } }));

const input = { name: 'Pets', kind: 'expense' as const, color: 'viz-2', icon: 'tag' };

describe('categoriesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(collection).mockReturnValue('categories-ref' as never);
    jest
      .mocked(doc)
      .mockImplementation(
        ((...segments: unknown[]) => `ref:${segments.slice(1).join('/')}`) as never,
      );
  });

  it('publishes the categories stored under the user', () => {
    jest.mocked(onSnapshot).mockImplementation(((
      _ref: unknown,
      next: (snapshot: unknown) => void,
    ) => {
      next({ docs: [{ id: 'c1', data: () => ({ ...input, archived: false }) }] });
      return jest.fn();
    }) as never);
    const onChange = jest.fn();

    subscribeToCategories('u1', onChange, jest.fn());

    expect(collection).toHaveBeenCalledWith({ name: 'db' }, 'users', 'u1', 'categories');
    expect(onChange).toHaveBeenCalledWith([{ id: 'c1', ...input, archived: false }]);
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

    subscribeToCategories('u1', jest.fn(), onError);

    expect(onError).toHaveBeenCalledWith('unavailable');
  });

  it('creates, updates and archives a category', async () => {
    jest.mocked(addDoc).mockResolvedValue({ id: 'new-id' } as never);

    await expect(createCategory('u1', input)).resolves.toBe('new-id');
    expect(addDoc).toHaveBeenCalledWith('categories-ref', { ...input, archived: false });

    await updateCategory('u1', 'c1', input);
    expect(updateDoc).toHaveBeenCalledWith('ref:users/u1/categories/c1', input);

    await setCategoryArchived('u1', 'c1', true);
    expect(updateDoc).toHaveBeenCalledWith('ref:users/u1/categories/c1', { archived: true });
  });

  describe('seeding the defaults', () => {
    const transaction = { get: jest.fn(), set: jest.fn() };

    beforeEach(() => {
      transaction.get.mockReset();
      transaction.set.mockReset();
      jest
        .mocked(runTransaction)
        .mockImplementation(((_db: unknown, run: (t: typeof transaction) => Promise<void>) =>
          run(transaction)) as never);
    });

    it('writes every default category and marks the user as seeded on the first sign-in', async () => {
      transaction.get.mockResolvedValue({ exists: () => false });

      await seedDefaultCategories('u1');

      expect(transaction.get).toHaveBeenCalledWith('ref:users/u1');
      expect(transaction.set).toHaveBeenCalledTimes(DEFAULT_CATEGORIES.length + 1);
      expect(transaction.set).toHaveBeenCalledWith(
        'ref:users/u1/categories/default-expense-alimentacao',
        { name: 'Alimentação', kind: 'expense', color: 'viz-5', icon: 'utensils', archived: false },
      );
      expect(transaction.set).toHaveBeenCalledWith('ref:users/u1', {
        seededAt: 'SERVER_TIMESTAMP',
      });
    });

    it('does nothing when the user was already seeded', async () => {
      transaction.get.mockResolvedValue({ exists: () => true });

      await seedDefaultCategories('u1');

      expect(transaction.set).not.toHaveBeenCalled();
    });
  });
});
