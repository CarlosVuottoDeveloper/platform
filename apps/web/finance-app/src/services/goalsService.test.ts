import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  addContribution,
  createGoal,
  deleteContribution,
  deleteGoal,
  subscribeToContributions,
  subscribeToGoals,
  updateGoal,
} from './goalsService';

jest.mock('./firebase', () => ({ db: { name: 'db' } }));

const goalInput = { name: 'Viagem', targetCents: 1000000, deadline: '2027-01-31' };
const batch = { delete: jest.fn(), commit: jest.fn() };

describe('goalsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(collection)
      .mockImplementation(
        ((...segments: unknown[]) => `col:${segments.slice(1).join('/')}`) as never,
      );
    jest
      .mocked(doc)
      .mockImplementation(
        ((...segments: unknown[]) => `ref:${segments.slice(1).join('/')}`) as never,
      );
    jest.mocked(writeBatch).mockReturnValue(batch as never);
    batch.commit.mockResolvedValue(undefined);
  });

  it('publishes goals and the contributions of one goal', () => {
    jest.mocked(onSnapshot).mockImplementation(((
      ref: string,
      next: (snapshot: unknown) => void,
    ) => {
      next({
        docs: ref.endsWith('contributions')
          ? [{ id: 'k1', data: () => ({ amountCents: 5000, date: '2026-03-01' }) }]
          : [{ id: 'g1', data: () => goalInput }],
      });
      return jest.fn();
    }) as never);
    const onGoals = jest.fn();
    const onContributions = jest.fn();

    subscribeToGoals('u1', onGoals, jest.fn());
    subscribeToContributions('u1', 'g1', onContributions, jest.fn());

    expect(onGoals).toHaveBeenCalledWith([{ id: 'g1', ...goalInput }]);
    expect(onSnapshot).toHaveBeenCalledWith(
      'col:users/u1/goals/g1/contributions',
      expect.any(Function),
      expect.any(Function),
    );
    expect(onContributions).toHaveBeenCalledWith([
      { id: 'k1', amountCents: 5000, date: '2026-03-01' },
    ]);
  });

  it('reports only the error code when a subscription fails', () => {
    jest.mocked(onSnapshot).mockImplementation(((
      _ref: unknown,
      _next: unknown,
      onError: (error: unknown) => void,
    ) => {
      onError({ code: 'unavailable' });
      return jest.fn();
    }) as never);
    const onError = jest.fn();

    subscribeToGoals('u1', jest.fn(), onError);
    subscribeToContributions('u1', 'g1', jest.fn(), onError);

    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledWith('unavailable');
  });

  it('creates and updates a goal', async () => {
    jest.mocked(addDoc).mockResolvedValue({ id: 'g-new' } as never);

    await expect(createGoal('u1', goalInput)).resolves.toBe('g-new');
    expect(addDoc).toHaveBeenCalledWith('col:users/u1/goals', goalInput);

    await updateGoal('u1', 'g1', goalInput);
    expect(updateDoc).toHaveBeenCalledWith('ref:users/u1/goals/g1', goalInput);
  });

  it('deletes a goal together with its contributions', async () => {
    jest
      .mocked(getDocs)
      .mockResolvedValue({ docs: [{ ref: 'ref:k1' }, { ref: 'ref:k2' }] } as never);

    await deleteGoal('u1', 'g1');

    expect(getDocs).toHaveBeenCalledWith('col:users/u1/goals/g1/contributions');
    expect(batch.delete.mock.calls.map(([ref]) => ref)).toEqual([
      'ref:k1',
      'ref:k2',
      'ref:users/u1/goals/g1',
    ]);
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  it('adds and removes a contribution', async () => {
    jest.mocked(addDoc).mockResolvedValue({ id: 'k-new' } as never);

    await addContribution('u1', 'g1', { amountCents: 5000, date: '2026-03-01' });
    expect(addDoc).toHaveBeenCalledWith('col:users/u1/goals/g1/contributions', {
      amountCents: 5000,
      date: '2026-03-01',
    });

    await deleteContribution('u1', 'g1', 'k1');
    expect(deleteDoc).toHaveBeenCalledWith('ref:users/u1/goals/g1/contributions/k1');
  });
});
