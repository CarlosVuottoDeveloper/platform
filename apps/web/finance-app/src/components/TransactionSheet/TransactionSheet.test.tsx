import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import { toCalendarDate } from '../../domain/calendarDate';
import type { Category } from '../../domain/category';
import { tx } from '../../domain/transaction.test-helpers';
import { subscribeToAccounts } from '../../services/accountsService';
import { seedDefaultCategories, subscribeToCategories } from '../../services/categoriesService';
import {
  createInstallments,
  createTransaction,
  subscribeToTransactions,
  updateTransaction,
  updateTransactions,
} from '../../services/transactionsService';
import { mockSignedInAs, renderSignedIn, testUser } from '../../test-utils';
import { TransactionSheet } from './TransactionSheet';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/transactionsService');

const account = (overrides: Partial<Account>): Account => ({
  id: 'a1',
  name: 'Nubank',
  type: 'bank',
  color: 'viz-1',
  icon: 'landmark',
  initialBalanceCents: 0,
  openingDate: '2026-01-01',
  archived: false,
  ...overrides,
});
const category = (overrides: Partial<Category>): Category => ({
  id: 'c1',
  name: 'Alimentação',
  kind: 'expense',
  color: 'viz-5',
  icon: 'utensils',
  archived: false,
  ...overrides,
});

const accounts = [
  account({ id: 'a1', name: 'Nubank' }),
  account({ id: 'a2', name: 'Carteira', type: 'cash' }),
  account({ id: 'a3', name: 'Conta antiga', archived: true }),
];
const categories = [
  category({ id: 'c1', name: 'Alimentação' }),
  category({ id: 'c2', name: 'Salário', kind: 'income' }),
  category({ id: 'c3', name: 'Categoria antiga', archived: true }),
];

function publish<T>(items: T[]) {
  return (_uid: string, onChange: (items: T[]) => void) => {
    onChange(items);
    return jest.fn();
  };
}

const optionsOf = (label: string) =>
  [...(screen.getByLabelText(label) as HTMLSelectElement).options].map((option) => option.text);

describe('TransactionSheet', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    jest.mocked(seedDefaultCategories).mockResolvedValue();
    jest.mocked(subscribeToAccounts).mockImplementation(publish(accounts));
    jest.mocked(subscribeToCategories).mockImplementation(publish(categories));
    jest.mocked(subscribeToTransactions).mockImplementation(publish([tx({ tags: ['mercado'] })]));
  });

  it('requires an amount, an account and a category', async () => {
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o valor')).toBeInTheDocument();
    expect(screen.getByText('Escolha a conta')).toBeInTheDocument();
    expect(screen.getByText('Escolha a categoria')).toBeInTheDocument();
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('offers only active accounts and the active categories of the chosen kind', async () => {
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    expect(optionsOf('Conta')).toEqual(['Selecione', 'Carteira', 'Nubank']);
    expect(optionsOf('Categoria')).toEqual(['Selecione', 'Alimentação']);

    await userEvent.click(screen.getByText('Receita'));

    expect(optionsOf('Categoria')).toEqual(['Selecione', 'Salário']);
  });

  it('saves an expense in cents with its tags', async () => {
    jest.mocked(createTransaction).mockResolvedValue('t-new');
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Valor'), '19,99');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação');
    await userEvent.type(screen.getByLabelText('Descrição (opcional)'), ' Padaria ');
    await userEvent.type(screen.getByLabelText('Tags'), 'café{Enter}');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(createTransaction).toHaveBeenCalledWith(testUser.uid, {
      kind: 'expense',
      amountCents: 1999,
      date: toCalendarDate(new Date()),
      accountId: 'a1',
      toAccountId: null,
      categoryId: 'c1',
      description: 'Padaria',
      tags: ['café'],
      recurrenceId: null,
      installment: null,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves an income', async () => {
    jest.mocked(createTransaction).mockResolvedValue('t-new');
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await userEvent.click(screen.getByText('Receita'));
    await userEvent.type(screen.getByLabelText('Valor'), '3.000');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Salário');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(createTransaction).toHaveBeenCalledWith(
      testUser.uid,
      expect.objectContaining({ kind: 'income', amountCents: 300000, categoryId: 'c2' }),
    );
  });

  it('clears the category when the kind changes', async () => {
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação');
    await userEvent.click(screen.getByText('Receita'));
    await userEvent.type(screen.getByLabelText('Valor'), '10');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Escolha a categoria')).toBeInTheDocument();
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('refuses a zero amount and a date before the account opened', async () => {
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Valor'), '0');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação');
    const date = screen.getByLabelText('Data');
    await userEvent.clear(date);
    await userEvent.type(date, '2025-12-31');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o valor')).toBeInTheDocument();
    expect(screen.getByText('Data anterior à abertura da conta')).toBeInTheDocument();
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('keeps the form filled and warns when saving fails', async () => {
    jest.mocked(createTransaction).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Valor'), '19,99');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor')).toHaveValue('19,99');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('edits a movement that points to an archived account and category, keeping its links', async () => {
    jest.mocked(updateTransaction).mockResolvedValue();
    const existing = tx({
      id: 't9',
      amountCents: 5000,
      date: '2026-02-10',
      accountId: 'a3',
      categoryId: 'c3',
      description: 'Antigo',
      tags: ['x'],
      recurrenceId: 'r1',
      installment: { groupId: 'g1', index: 1, count: 2 },
    });
    renderSignedIn(<TransactionSheet transaction={existing} onClose={onClose} />);

    expect(screen.getByLabelText('Valor')).toHaveValue('50,00');
    expect(optionsOf('Conta')).toContain('Conta antiga');
    expect(optionsOf('Categoria')).toContain('Categoria antiga');
    const amount = screen.getByLabelText('Valor');
    await userEvent.clear(amount);
    await userEvent.type(amount, '60');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateTransaction).toHaveBeenCalledWith(testUser.uid, 't9', {
      kind: 'expense',
      amountCents: 6000,
      date: '2026-02-10',
      accountId: 'a3',
      toAccountId: null,
      categoryId: 'c3',
      description: 'Antigo',
      tags: ['x'],
      recurrenceId: 'r1',
      installment: { groupId: 'g1', index: 1, count: 2 },
    });
  });

  it('preselects the account when there is only one', async () => {
    jest.mocked(subscribeToAccounts).mockImplementation(publish([accounts[0] as Account]));

    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await waitFor(() => expect(screen.getByLabelText('Conta')).toHaveValue('a1'));
  });

  describe('instalments', () => {
    it('splits a new expense into monthly instalments', async () => {
      jest.mocked(createInstallments).mockResolvedValue();
      renderSignedIn(<TransactionSheet onClose={onClose} />);

      await userEvent.type(screen.getByLabelText('Valor'), '100');
      await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
      await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação');
      await userEvent.selectOptions(screen.getByLabelText('Parcelar em'), '3x');
      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(createInstallments).toHaveBeenCalledWith(
        testUser.uid,
        expect.objectContaining({ kind: 'expense', amountCents: 10000, installment: null }),
        3,
      );
      expect(createTransaction).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('offers up to 48 instalments, only for a new expense', async () => {
      renderSignedIn(<TransactionSheet onClose={onClose} />);

      expect(optionsOf('Parcelar em')).toHaveLength(48);
      expect(optionsOf('Parcelar em').slice(0, 2)).toEqual(['À vista', '2x']);

      await userEvent.click(screen.getByText('Receita'));

      expect(screen.queryByLabelText('Parcelar em')).not.toBeInTheDocument();
    });

    it('does not offer to split when editing', () => {
      renderSignedIn(<TransactionSheet transaction={tx({ id: 't1' })} onClose={onClose} />);

      expect(screen.queryByLabelText('Parcelar em')).not.toBeInTheDocument();
    });

    const first = tx({
      id: 'i1',
      amountCents: 3334,
      date: '2026-01-31',
      accountId: 'a1',
      categoryId: 'c1',
      installment: { groupId: 'g1', index: 1, count: 3 },
    });
    const second = tx({
      id: 'i2',
      amountCents: 3333,
      date: '2026-02-28',
      accountId: 'a1',
      categoryId: 'c1',
      installment: { groupId: 'g1', index: 2, count: 3 },
    });
    const third = tx({
      id: 'i3',
      amountCents: 3333,
      date: '2026-03-31',
      accountId: 'a1',
      categoryId: 'c1',
      installment: { groupId: 'g1', index: 3, count: 3 },
    });

    it('applies an edit to this instalment and the following ones, each keeping its date', async () => {
      jest.mocked(subscribeToTransactions).mockImplementation(publish([first, second, third]));
      jest.mocked(updateTransactions).mockResolvedValue();
      renderSignedIn(<TransactionSheet transaction={second} onClose={onClose} />);

      const amount = screen.getByLabelText('Valor');
      await userEvent.clear(amount);
      await userEvent.type(amount, '40');
      await userEvent.selectOptions(screen.getByLabelText('Aplicar a'), 'Esta e as seguintes');
      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(updateTransactions).toHaveBeenCalledWith(testUser.uid, [
        {
          id: 'i2',
          input: expect.objectContaining({
            amountCents: 4000,
            date: '2026-02-28',
            installment: { groupId: 'g1', index: 2, count: 3 },
          }),
        },
        {
          id: 'i3',
          input: expect.objectContaining({
            amountCents: 4000,
            date: '2026-03-31',
            installment: { groupId: 'g1', index: 3, count: 3 },
          }),
        },
      ]);
      expect(updateTransaction).not.toHaveBeenCalled();
    });

    it('keeps each following instalment at its own amount when the amount was not edited', async () => {
      jest.mocked(subscribeToTransactions).mockImplementation(publish([first, second, third]));
      jest.mocked(updateTransactions).mockResolvedValue();
      renderSignedIn(<TransactionSheet transaction={first} onClose={onClose} />);

      await userEvent.type(screen.getByLabelText('Descrição (opcional)'), 'Notebook');
      await userEvent.selectOptions(screen.getByLabelText('Aplicar a'), 'Esta e as seguintes');
      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(updateTransactions).toHaveBeenCalledWith(testUser.uid, [
        {
          id: 'i1',
          input: expect.objectContaining({ amountCents: 3334, description: 'Notebook' }),
        },
        {
          id: 'i2',
          input: expect.objectContaining({ amountCents: 3333, description: 'Notebook' }),
        },
        {
          id: 'i3',
          input: expect.objectContaining({ amountCents: 3333, description: 'Notebook' }),
        },
      ]);
    });

    it('edits only this instalment by default', async () => {
      jest.mocked(subscribeToTransactions).mockImplementation(publish([first, second, third]));
      jest.mocked(updateTransaction).mockResolvedValue();
      renderSignedIn(<TransactionSheet transaction={second} onClose={onClose} />);

      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(updateTransaction).toHaveBeenCalledWith(
        testUser.uid,
        'i2',
        expect.objectContaining({ amountCents: 3333 }),
      );
      expect(updateTransactions).not.toHaveBeenCalled();
    });

    it('does not ask about following instalments on the last one', () => {
      jest.mocked(subscribeToTransactions).mockImplementation(publish([first, second, third]));
      renderSignedIn(<TransactionSheet transaction={third} onClose={onClose} />);

      expect(screen.queryByLabelText('Aplicar a')).not.toBeInTheDocument();
    });
  });

  it('includes a tag left unconfirmed in the tag field when saving', async () => {
    jest.mocked(createTransaction).mockResolvedValue('t-new');
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Valor'), '10');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação');
    await userEvent.type(screen.getByLabelText('Tags'), 'viagem');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(createTransaction).toHaveBeenCalledWith(
      testUser.uid,
      expect.objectContaining({ tags: ['viagem'] }),
    );
  });

  it('refuses to split an amount into more instalments than it has cents', async () => {
    renderSignedIn(<TransactionSheet onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('Valor'), '0,05');
    await userEvent.selectOptions(screen.getByLabelText('Conta'), 'Nubank');
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação');
    await userEvent.selectOptions(screen.getByLabelText('Parcelar em'), '10x');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Valor pequeno demais para esse número de parcelas'),
    ).toBeInTheDocument();
    expect(createInstallments).not.toHaveBeenCalled();
  });
});
