import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import { toCalendarDate, yearMonthOf } from '../../domain/calendarDate';
import type { Category } from '../../domain/category';
import type { Recurrence } from '../../domain/recurrence';
import { subscribeToAccounts } from '../../services/accountsService';
import { seedDefaultCategories, subscribeToCategories } from '../../services/categoriesService';
import {
  createRecurrence,
  deleteRecurrence,
  materializeDueRecurrences,
  subscribeToRecurrences,
  updateRecurrence,
} from '../../services/recurrencesService';
import { subscribeToTransactions } from '../../services/transactionsService';
import { mockSignedInAs, money, renderSignedIn, testUser } from '../../test-utils';
import { RecurrencesSection } from './RecurrencesSection';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/transactionsService');
jest.mock('../../services/recurrencesService');

const today = toCalendarDate(new Date());
const accounts = [
  { id: 'a1', name: 'Nubank', type: 'bank', archived: false, openingDate: '2020-01-01' },
  { id: 'a2', name: 'Carteira', type: 'cash', archived: false, openingDate: '2020-01-01' },
] as Account[];
const categories = [
  { id: 'c1', name: 'Moradia', kind: 'expense', archived: false },
  { id: 'c2', name: 'Salário', kind: 'income', archived: false },
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
  materializedThrough: yearMonthOf(today),
};

function publish<T>(items: T[]) {
  return (_uid: string, onChange: (items: T[]) => void) => {
    onChange(items);
    return jest.fn();
  };
}

describe('RecurrencesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    jest.mocked(seedDefaultCategories).mockResolvedValue();
    jest.mocked(materializeDueRecurrences).mockResolvedValue();
    jest.mocked(subscribeToAccounts).mockImplementation(publish(accounts));
    jest.mocked(subscribeToCategories).mockImplementation(publish(categories));
    jest.mocked(subscribeToTransactions).mockImplementation(publish([]));
    jest.mocked(subscribeToRecurrences).mockImplementation(publish([rent]));
  });

  it('turns due occurrences into movements when the rules load', () => {
    renderSignedIn(<RecurrencesSection />);

    expect(materializeDueRecurrences).toHaveBeenCalledWith(testUser.uid, [rent], today);
  });

  it('lists each rule with its amount, day and account', () => {
    renderSignedIn(<RecurrencesSection />);

    const row = screen.getByTestId('recurrence-r1');
    expect(within(row).getByText('Aluguel')).toBeInTheDocument();
    expect(within(row).getByText('Todo dia 5 · Moradia · Nubank')).toBeInTheDocument();
    expect(within(row).getByText(money('-R$ 1.500,00'))).toBeInTheDocument();
  });

  it('shows an empty hint when there are no rules', () => {
    jest.mocked(subscribeToRecurrences).mockImplementation(publish([]));

    renderSignedIn(<RecurrencesSection />);

    expect(screen.getByText('Nenhuma movimentação recorrente.')).toBeInTheDocument();
  });

  it('creates a monthly rule starting this month', async () => {
    jest.mocked(createRecurrence).mockResolvedValue('r-new');
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova recorrente' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Valor'), '99,90');
    const day = within(dialog).getByLabelText('Dia do mês');
    await userEvent.clear(day);
    await userEvent.type(day, '31');
    await userEvent.selectOptions(within(dialog).getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(within(dialog).getByLabelText('Categoria'), 'Moradia');
    await userEvent.type(within(dialog).getByLabelText('Descrição (opcional)'), 'Internet');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(createRecurrence).toHaveBeenCalledWith(testUser.uid, {
      kind: 'expense',
      amountCents: 9990,
      dayOfMonth: 31,
      accountId: 'a1',
      categoryId: 'c1',
      description: 'Internet',
      tags: [],
      startMonth: yearMonthOf(today),
      endMonth: null,
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('creates an income rule with an end month', async () => {
    jest.mocked(createRecurrence).mockResolvedValue('r-new');
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova recorrente' }));
    await userEvent.click(screen.getByText('Receita'));
    await userEvent.type(screen.getByLabelText('Valor'), '5.000');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Salário');
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '2027-01' } });
    fireEvent.change(screen.getByLabelText('Fim (opcional)'), { target: { value: '2027-12' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(createRecurrence).toHaveBeenCalledWith(
      testUser.uid,
      expect.objectContaining({
        kind: 'income',
        amountCents: 500000,
        categoryId: 'c2',
        startMonth: '2027-01',
        endMonth: '2027-12',
      }),
    );
  });

  it('validates amount, day, account, category and the month range', async () => {
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova recorrente' }));
    const day = screen.getByLabelText('Dia do mês');
    await userEvent.clear(day);
    await userEvent.type(day, '32');
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '2027-06' } });
    fireEvent.change(screen.getByLabelText('Fim (opcional)'), { target: { value: '2027-01' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o valor')).toBeInTheDocument();
    expect(screen.getByText('Informe um dia entre 1 e 31')).toBeInTheDocument();
    expect(screen.getByText('Escolha a conta')).toBeInTheDocument();
    expect(screen.getByText('Escolha a categoria')).toBeInTheDocument();
    expect(screen.getByText('O fim não pode ser antes do início')).toBeInTheDocument();
    expect(createRecurrence).not.toHaveBeenCalled();
  });

  it('edits a rule, warning that only upcoming movements change', async () => {
    jest.mocked(updateRecurrence).mockResolvedValue();
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Aluguel' }));
    expect(screen.getByText('Vale para os próximos lançamentos.')).toBeInTheDocument();
    const amount = screen.getByLabelText('Valor');
    await userEvent.clear(amount);
    await userEvent.type(amount, '1.600');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateRecurrence).toHaveBeenCalledWith(testUser.uid, 'r1', {
      kind: 'expense',
      amountCents: 160000,
      dayOfMonth: 5,
      accountId: 'a1',
      categoryId: 'c1',
      description: 'Aluguel',
      tags: [],
      startMonth: '2026-01',
      endMonth: null,
    });
  });

  it('deletes a rule only after confirmation', async () => {
    jest.mocked(deleteRecurrence).mockResolvedValue();
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Aluguel' }));
    expect(deleteRecurrence).not.toHaveBeenCalled();
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );

    expect(deleteRecurrence).toHaveBeenCalledWith(testUser.uid, 'r1');
  });

  it('warns when saving fails', async () => {
    jest.mocked(updateRecurrence).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Aluguel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
  });

  it('refuses a first occurrence before the account was opened', async () => {
    jest
      .mocked(subscribeToAccounts)
      .mockImplementation(
        publish([{ ...accounts[0], openingDate: '2027-03-10' } as Account, accounts[1] as Account]),
      );
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova recorrente' }));
    await userEvent.type(screen.getByLabelText('Valor'), '100');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Moradia');
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '2027-03' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('O primeiro lançamento seria antes da abertura da conta'),
    ).toBeInTheDocument();
    expect(createRecurrence).not.toHaveBeenCalled();

    const day = screen.getByLabelText('Dia do mês');
    await userEvent.clear(day);
    await userEvent.type(day, '10');
    jest.mocked(createRecurrence).mockResolvedValue('r-new');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(createRecurrence).toHaveBeenCalledTimes(1));
  });

  it('warns when deleting a rule fails', async () => {
    jest.mocked(deleteRecurrence).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Aluguel' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );

    expect(await screen.findByText('Não foi possível excluir.')).toBeInTheDocument();
  });

  it('names a rule without description by its category and marks income with a plus sign', () => {
    jest
      .mocked(subscribeToRecurrences)
      .mockImplementation(
        publish([{ ...rent, id: 'r2', kind: 'income', categoryId: 'c2', description: '' }]),
      );

    renderSignedIn(<RecurrencesSection />);

    const row = within(screen.getByTestId('recurrence-r2'));
    expect(row.getByText('Salário')).toBeInTheDocument();
    expect(row.getByText(money('+R$ 1.500,00'))).toBeInTheDocument();
  });

  it('asks for a start month and keeps an archived account of an existing rule selectable', async () => {
    jest
      .mocked(subscribeToAccounts)
      .mockImplementation(
        publish([{ ...accounts[0], archived: true } as Account, accounts[1] as Account]),
      );
    renderSignedIn(<RecurrencesSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Aluguel' }));
    expect(screen.getByLabelText('Conta')).toHaveValue('a1');
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o mês de início')).toBeInTheDocument();
  });
});
