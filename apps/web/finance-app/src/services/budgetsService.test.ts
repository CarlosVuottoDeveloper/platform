import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { deleteBudget, setBudget, subscribeToBudgets } from './budgetsService';

jest.mock('./firebase', () => ({ db: { name: 'db' } }));

describe('budgetsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(collection).mockReturnValue('budgets-ref' as never);
    jest
      .mocked(doc)
      .mockImplementation(
        ((...segments: unknown[]) => `ref:${segments.slice(1).join('/')}`) as never,
      );
  });

  it('publishes the budgets stored under the user', () => {
    jest.mocked(onSnapshot).mockImplementation(((
      _ref: unknown,
      next: (snapshot: unknown) => void,
    ) => {
      next({ docs: [{ id: 'c1', data: () => ({ categoryId: 'c1', limitCents: 100000 }) }] });
      return jest.fn();
    }) as never);
    const onChange = jest.fn();

    subscribeToBudgets('u1', onChange, jest.fn());

    expect(collection).toHaveBeenCalledWith({ name: 'db' }, 'users', 'u1', 'budgets');
    expect(onChange).toHaveBeenCalledWith([{ id: 'c1', categoryId: 'c1', limitCents: 100000 }]);
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

    subscribeToBudgets('u1', jest.fn(), onError);

    expect(onError).toHaveBeenCalledWith('unavailable');
  });

  it('keeps one budget per category, keyed by the category id', async () => {
    await setBudget('u1', 'c1', 100000);

    expect(setDoc).toHaveBeenCalledWith('ref:users/u1/budgets/c1', {
      categoryId: 'c1',
      limitCents: 100000,
    });
  });

  it('removes a budget', async () => {
    await deleteBudget('u1', 'c1');

    expect(deleteDoc).toHaveBeenCalledWith('ref:users/u1/budgets/c1');
  });
});
