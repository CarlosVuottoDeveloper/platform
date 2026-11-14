import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySheet } from '../../components/CategorySheet/CategorySheet';
import { RecurrenceSheet } from '../../components/RecurrenceSheet/RecurrenceSheet';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import type { Recurrence } from '../../domain/recurrence';
import { subscribeToAccounts } from '../../services/accountsService';
import {
  createCategory,
  seedDefaultCategories,
  setCategoryArchived,
  subscribeToCategories,
} from '../../services/categoriesService';
import {
  createRecurrence,
  deleteRecurrence,
  materializeDueRecurrences,
  subscribeToRecurrences,
} from '../../services/recurrencesService';
import { subscribeToTransactions } from '../../services/transactionsService';
import { mockSignedInAs, renderSignedIn, testUser } from '../../test-utils';
import { Settings } from './Settings';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

const accounts = [
  { id: 'a1', name: 'Nubank', type: 'bank', archived: true, openingDate: '2020-01-01' },
  { id: 'a2', name: 'Carteira', type: 'cash', archived: false, openingDate: '2020-01-01' },
] as Account[];
const categories = [
  { id: 'c1', name: 'Moradia', kind: 'expense', color: 'viz-1', icon: 'house', archived: false },
] as Category[];
const rent: Recurrence = {
  id: 'r1',
  kind: 'expense',
  amountCents: 150000,
  dayOfMonth: 5,
  accountId: 'a1',
  categoryId: 'c1',
  description: 'Aluguel',
  tags: [],
  startMonth: '2026-01',
  endMonth: null,
  materializedThrough: '2026-01',
};

function publish<T>(items: T[]) {
  return (_uid: string, onChange: (items: T[]) => void) => {
    onChange(items);
    return jest.fn();
  };
}

describe('Settings — failures and edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    jest.mocked(seedDefaultCategories).mockResolvedValue();
    jest.mocked(materializeDueRecurrences).mockResolvedValue();
    jest.mocked(subscribeToAccounts).mockImplementation(publish(accounts));
    jest.mocked(subscribeToCategories).mockImplementation(publish(categories));
    jest.mocked(subscribeToRecurrences).mockImplementation(publish([rent]));
    jest.mocked(subscribeToTransactions).mockImplementation(publish([]));
  });

  it('keeps working when the default categories cannot be created', async () => {
    jest.mocked(seedDefaultCategories).mockRejectedValue({ code: 'unavailable' });

    renderSignedIn(<Settings />);

    await waitFor(() => expect(seedDefaultCategories).toHaveBeenCalledWith(testUser.uid));
    expect(screen.getByText('Moradia')).toBeInTheDocument();
  });

  it('warns when archiving a category fails', async () => {
    jest.mocked(setCategoryArchived).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Arquivar Moradia' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
  });

  it('warns when deleting a recurring rule fails', async () => {
    jest.mocked(deleteRecurrence).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Aluguel' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );

    expect(await screen.findByText('Não foi possível excluir.')).toBeInTheDocument();
  });

  it('keeps the archived account of an existing rule selectable and asks for a start month', async () => {
    renderSignedIn(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Aluguel' }));
    expect(screen.getByLabelText('Conta')).toHaveValue('a1');
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o mês de início')).toBeInTheDocument();
  });

  it('saves nothing from the forms once the session has ended', async () => {
    mockSignedInAs(null);
    renderSignedIn(
      <>
        <CategorySheet onClose={jest.fn()} />
        <RecurrenceSheet recurrence={rent} onClose={jest.fn()} />
      </>,
    );

    await userEvent.type(screen.getByLabelText('Nome'), 'Pets');
    for (const button of screen.getAllByRole('button', { name: 'Salvar' })) {
      await userEvent.click(button);
    }

    expect(createCategory).not.toHaveBeenCalled();
    expect(createRecurrence).not.toHaveBeenCalled();
  });
});
