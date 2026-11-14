import { screen, within } from '@testing-library/react';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import { tx } from '../../domain/transaction.test-helpers';
import type { Transaction } from '../../domain/transaction';
import { subscribeToAccounts } from '../../services/accountsService';
import { seedDefaultCategories, subscribeToCategories } from '../../services/categoriesService';
import {
  materializeDueRecurrences,
  subscribeToRecurrences,
} from '../../services/recurrencesService';
import { subscribeToTransactions } from '../../services/transactionsService';
import { mockSignedInAs, renderSignedIn, testUser } from '../../test-utils';
import { Dashboard } from './Dashboard';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

const account = {
  id: 'a',
  name: 'Nubank',
  type: 'bank',
  color: 'viz-1',
  icon: 'landmark',
  initialBalanceCents: 0,
  openingDate: '2026-01-01',
  archived: false,
} as Account;
const categories = [{ id: 'c1', name: 'Moradia', kind: 'expense', archived: false }] as Category[];

function publish<T>(items: T[]) {
  return (_uid: string, onChange: (items: T[]) => void) => {
    onChange(items);
    return jest.fn();
  };
}

function renderWith(transactions: Transaction[]) {
  jest.mocked(subscribeToTransactions).mockImplementation(publish(transactions));
  renderSignedIn(<Dashboard />);
}

describe('Dashboard — latest movements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    mockSignedInAs(testUser);
    jest.mocked(seedDefaultCategories).mockResolvedValue();
    jest.mocked(materializeDueRecurrences).mockResolvedValue();
    jest.mocked(subscribeToAccounts).mockImplementation(publish([account]));
    jest.mocked(subscribeToCategories).mockImplementation(publish(categories));
    jest.mocked(subscribeToRecurrences).mockImplementation(publish([]));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('names a movement without description by its category, or as a transfer', () => {
    renderWith([
      tx({
        id: 'n1',
        kind: 'expense',
        date: '2026-03-02',
        accountId: 'a',
        categoryId: 'c1',
        description: '',
      }),
      tx({
        id: 'n2',
        kind: 'transfer',
        date: '2026-03-01',
        accountId: 'a',
        toAccountId: 'b',
        description: '',
      }),
    ]);

    const latest = within(screen.getByRole('region', { name: 'Últimas movimentações' }));
    expect(latest.getByText('Moradia')).toBeInTheDocument();
    expect(latest.getByText('Transferência')).toBeInTheDocument();
  });

  it('says so when there are no movements yet', () => {
    renderWith([]);

    expect(screen.getByText('Nenhuma movimentação ainda.')).toBeInTheDocument();
  });
});
