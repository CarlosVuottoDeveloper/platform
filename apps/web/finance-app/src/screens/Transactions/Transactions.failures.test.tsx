import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toCalendarDate, yearMonthOf } from '../../domain/calendarDate';
import { tx } from '../../domain/transaction.test-helpers';
import { subscribeToAccounts } from '../../services/accountsService';
import { seedDefaultCategories, subscribeToCategories } from '../../services/categoriesService';
import {
  materializeDueRecurrences,
  subscribeToRecurrences,
} from '../../services/recurrencesService';
import { deleteTransactions, subscribeToTransactions } from '../../services/transactionsService';
import { mockSignedInAs, renderSignedIn, testUser } from '../../test-utils';
import { Transactions } from './Transactions';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

function publish<T>(items: T[]) {
  return (_uid: string, onChange: (items: T[]) => void) => {
    onChange(items);
    return jest.fn();
  };
}

describe('Transactions — failures', () => {
  it('warns when deleting a movement fails', async () => {
    mockSignedInAs(testUser);
    jest.mocked(seedDefaultCategories).mockResolvedValue();
    jest.mocked(materializeDueRecurrences).mockResolvedValue();
    jest.mocked(subscribeToAccounts).mockImplementation(publish([]));
    jest.mocked(subscribeToCategories).mockImplementation(publish([]));
    jest.mocked(subscribeToRecurrences).mockImplementation(publish([]));
    jest.mocked(subscribeToTransactions).mockImplementation(
      publish([
        tx({
          id: 't1',
          date: `${yearMonthOf(toCalendarDate(new Date()))}-01`,
          description: 'Padaria',
        }),
      ]),
    );
    jest.mocked(deleteTransactions).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Transactions />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Padaria' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );

    expect(await screen.findByText('Não foi possível excluir.')).toBeInTheDocument();
  });
});
