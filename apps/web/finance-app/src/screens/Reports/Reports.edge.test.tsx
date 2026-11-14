import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import { mockSignedInAs, mockUserData, renderSignedIn, testUser } from '../../test-utils';
import { Reports } from './Reports';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/budgetsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/exportService');
jest.mock('../../services/goalsService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

const account = {
  id: 'a',
  name: 'Nubank',
  type: 'bank',
  color: 'viz-1',
  icon: 'landmark',
  initialBalanceCents: 100000,
  openingDate: '2026-01-01',
  archived: false,
} as Account;

describe('Reports — tabs and edge months', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    mockSignedInAs(testUser);
    mockUserData({ accounts: [account] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens the filtered report tab', async () => {
    renderSignedIn(<Reports />);

    await user.click(screen.getByRole('tab', { name: 'Relatório' }));

    expect(screen.getByLabelText('De')).toHaveValue('2026-03-01');
  });

  it('explains that a future month has no balance history yet', async () => {
    renderSignedIn(<Reports />);

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(screen.getByText('Este mês ainda não começou')).toBeInTheDocument();
  });
});
