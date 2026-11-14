import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import { addMonths, toCalendarDate, yearMonthOf } from '../../domain/calendarDate';
import type { Category } from '../../domain/category';
import { tx } from '../../domain/transaction.test-helpers';
import type { Transaction } from '../../domain/transaction';
import { subscribeToAccounts } from '../../services/accountsService';
import { seedDefaultCategories, subscribeToCategories } from '../../services/categoriesService';
import {
  materializeDueRecurrences,
  subscribeToRecurrences,
} from '../../services/recurrencesService';
import { deleteTransactions, subscribeToTransactions } from '../../services/transactionsService';
import { mockSignedInAs, money, renderSignedIn, testUser } from '../../test-utils';
import { Transactions } from './Transactions';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/transactionsService');
jest.mock('../../services/recurrencesService');

const today = toCalendarDate(new Date());
const thisMonth = yearMonthOf(today);
const firstOfMonth = `${thisMonth}-01`;

const accounts = [
  { id: 'a1', name: 'Nubank', type: 'bank', archived: false, openingDate: '2020-01-01' },
  { id: 'a2', name: 'Conta antiga', type: 'bank', archived: true, openingDate: '2020-01-01' },
] as Account[];
const categories = [
  { id: 'c1', name: 'Alimentação', kind: 'expense', archived: false },
  { id: 'c2', name: 'Categoria antiga', kind: 'expense', archived: true },
  { id: 'c3', name: 'Salário', kind: 'income', archived: false },
] as Category[];

function publish<T>(items: T[]) {
  return (_uid: string, onChange: (items: T[]) => void) => {
    onChange(items);
    return jest.fn();
  };
}

function mockTransactions(transactions: Transaction[]) {
  jest.mocked(subscribeToTransactions).mockImplementation(publish(transactions));
}

describe('Transactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    jest.mocked(seedDefaultCategories).mockResolvedValue();
    jest.mocked(subscribeToAccounts).mockImplementation(publish(accounts));
    jest.mocked(subscribeToCategories).mockImplementation(publish(categories));
    mockTransactions([]);
    jest.mocked(materializeDueRecurrences).mockResolvedValue();
    jest.mocked(subscribeToRecurrences).mockImplementation(publish([]));
  });

  it('shows an empty state for a month without movements', () => {
    renderSignedIn(<Transactions />);

    expect(screen.getByText('Nenhuma movimentação neste mês')).toBeInTheDocument();
  });

  it('lists the movements of the current month with amount, category and account', () => {
    mockTransactions([
      tx({
        id: 't1',
        kind: 'expense',
        amountCents: 1999,
        date: firstOfMonth,
        accountId: 'a1',
        categoryId: 'c1',
        description: 'Padaria',
      }),
      tx({
        id: 't2',
        kind: 'income',
        amountCents: 300000,
        date: firstOfMonth,
        accountId: 'a1',
        categoryId: 'c3',
      }),
      tx({ id: 't3', date: `${addMonths(thisMonth, -1)}-10`, description: 'Mês passado' }),
    ]);

    renderSignedIn(<Transactions />);

    const expense = screen.getByTestId('transaction-t1');
    expect(within(expense).getByText('Padaria')).toBeInTheDocument();
    expect(within(expense).getByText('Alimentação · Nubank')).toBeInTheDocument();
    expect(within(expense).getByText(money('-R$ 19,99'))).toBeInTheDocument();
    const income = screen.getByTestId('transaction-t2');
    expect(within(income).getByText('Salário')).toBeInTheDocument();
    expect(within(income).getByText(money('+R$ 3.000,00'))).toBeInTheDocument();
    expect(screen.queryByText('Mês passado')).not.toBeInTheDocument();
  });

  it('shows movements of archived accounts and categories with their names', () => {
    mockTransactions([
      tx({
        id: 't1',
        date: firstOfMonth,
        accountId: 'a2',
        categoryId: 'c2',
        description: 'Antigo',
      }),
    ]);

    renderSignedIn(<Transactions />);

    expect(
      within(screen.getByTestId('transaction-t1')).getByText('Categoria antiga · Conta antiga'),
    ).toBeInTheDocument();
  });

  it('describes a transfer by its two accounts and offers no edit', () => {
    mockTransactions([
      tx({
        id: 't1',
        kind: 'transfer',
        amountCents: 30000,
        date: firstOfMonth,
        accountId: 'a1',
        toAccountId: 'a2',
      }),
    ]);

    renderSignedIn(<Transactions />);

    const row = screen.getByTestId('transaction-t1');
    expect(within(row).getByText('Transferência')).toBeInTheDocument();
    expect(within(row).getByText('Nubank → Conta antiga')).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
  });

  it('marks future-dated movements as upcoming', () => {
    mockTransactions([tx({ id: 't1', date: '2999-01-01' }), tx({ id: 't2', date: firstOfMonth })]);

    renderSignedIn(<Transactions />);

    expect(
      within(screen.getByTestId('transaction-t2')).queryByText('Prevista'),
    ).not.toBeInTheDocument();
  });

  it('navigates between months', async () => {
    mockTransactions([
      tx({ id: 't3', date: `${addMonths(thisMonth, -1)}-10`, description: 'Mês passado' }),
    ]);
    renderSignedIn(<Transactions />);

    await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(screen.getByText('Mês passado')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(screen.queryByText('Mês passado')).not.toBeInTheDocument();
  });

  it('flags a movement dated later in a future month as upcoming', async () => {
    mockTransactions([tx({ id: 't1', date: `${addMonths(thisMonth, 1)}-15` })]);
    renderSignedIn(<Transactions />);

    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(within(screen.getByTestId('transaction-t1')).getByText('Prevista')).toBeInTheDocument();
  });

  it('filters by description', async () => {
    mockTransactions([
      tx({ id: 't1', date: firstOfMonth, description: 'Padaria' }),
      tx({ id: 't2', date: firstOfMonth, description: 'Uber' }),
    ]);
    renderSignedIn(<Transactions />);

    await userEvent.type(screen.getByRole('searchbox'), 'pada');

    expect(screen.getByText('Padaria')).toBeInTheDocument();
    expect(screen.queryByText('Uber')).not.toBeInTheDocument();
  });

  it('opens the form to edit a movement', async () => {
    mockTransactions([
      tx({
        id: 't1',
        date: firstOfMonth,
        amountCents: 1999,
        description: 'Padaria',
        accountId: 'a1',
        categoryId: 'c1',
      }),
    ]);
    renderSignedIn(<Transactions />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Padaria' }));

    expect(within(screen.getByRole('dialog')).getByLabelText('Valor')).toHaveValue('19,99');
  });

  it('deletes a movement only after confirmation', async () => {
    jest.mocked(deleteTransactions).mockResolvedValue();
    mockTransactions([tx({ id: 't1', date: firstOfMonth, description: 'Padaria' })]);
    renderSignedIn(<Transactions />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Padaria' }));
    expect(deleteTransactions).not.toHaveBeenCalled();
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );

    expect(deleteTransactions).toHaveBeenCalledWith(testUser.uid, ['t1']);
  });

  describe('instalments', () => {
    const instalment = (index: number) =>
      tx({
        id: `i${index}`,
        date: firstOfMonth,
        description: `Notebook ${index}`,
        installment: { groupId: 'g1', index, count: 3 },
      });

    beforeEach(() => {
      jest.mocked(deleteTransactions).mockResolvedValue();
      mockTransactions([instalment(1), instalment(2), instalment(3)]);
    });

    it('shows which instalment each movement is', () => {
      renderSignedIn(<Transactions />);

      expect(within(screen.getByTestId('transaction-i2')).getByText('2 de 3')).toBeInTheDocument();
    });

    it('deletes this instalment and the following ones when asked', async () => {
      renderSignedIn(<Transactions />);

      await userEvent.click(screen.getByRole('button', { name: 'Excluir Notebook 2' }));
      await userEvent.click(screen.getByRole('button', { name: 'Esta e as seguintes' }));

      expect(deleteTransactions).toHaveBeenCalledWith(testUser.uid, ['i2', 'i3']);
    });

    it('deletes only this instalment when asked', async () => {
      renderSignedIn(<Transactions />);

      await userEvent.click(screen.getByRole('button', { name: 'Excluir Notebook 2' }));
      await userEvent.click(screen.getByRole('button', { name: 'Só esta' }));

      expect(deleteTransactions).toHaveBeenCalledWith(testUser.uid, ['i2']);
    });

    it('asks a plain confirmation for the last instalment', async () => {
      renderSignedIn(<Transactions />);

      await userEvent.click(screen.getByRole('button', { name: 'Excluir Notebook 3' }));

      expect(screen.queryByRole('button', { name: 'Esta e as seguintes' })).not.toBeInTheDocument();
      await userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
      );
      expect(deleteTransactions).toHaveBeenCalledWith(testUser.uid, ['i3']);
    });
  });

  it('shows the upcoming occurrence of a recurring rule as a forecast that cannot be edited', async () => {
    jest.mocked(subscribeToRecurrences).mockImplementation(
      publish([
        {
          id: 'r1',
          kind: 'expense' as const,
          amountCents: 150000,
          dayOfMonth: 5,
          accountId: 'a1',
          categoryId: 'c1',
          description: 'Aluguel',
          tags: [],
          startMonth: '2020-01',
          endMonth: null,
          materializedThrough: thisMonth,
        },
      ]),
    );
    renderSignedIn(<Transactions />);

    expect(screen.queryByText('Aluguel')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));

    const row = screen.getByTestId(`transaction-r1_${addMonths(thisMonth, 1)}`);
    expect(within(row).getByText('Aluguel')).toBeInTheDocument();
    expect(within(row).getByText('Prevista')).toBeInTheDocument();
    expect(within(row).queryByRole('button')).not.toBeInTheDocument();
  });

  it('warns when deleting fails', async () => {
    jest.mocked(deleteTransactions).mockRejectedValue({ code: 'unavailable' });
    mockTransactions([tx({ id: 't1', date: firstOfMonth, description: 'Padaria' })]);
    renderSignedIn(<Transactions />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Padaria' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );

    expect(await screen.findByText('Não foi possível excluir.')).toBeInTheDocument();
  });

  it('keeps the date groups together inside one card', () => {
    mockTransactions([
      tx({ id: 'g1', date: firstOfMonth, accountId: 'a1', description: 'Primeiro' }),
      tx({ id: 'g2', date: `${thisMonth}-02`, accountId: 'a1', description: 'Segundo' }),
    ]);

    renderSignedIn(<Transactions />);

    const card = screen.getByTestId('transactions-card');
    expect(card).toContainElement(screen.getByTestId('transaction-g1'));
    expect(card).toContainElement(screen.getByTestId('transaction-g2'));
    expect(card.style.background).toContain('var(--gradient-surface)');
  });

  it('shows the empty state without an empty card', () => {
    renderSignedIn(<Transactions />);

    expect(screen.queryByTestId('transactions-card')).not.toBeInTheDocument();
    expect(screen.getByText('Nenhuma movimentação neste mês')).toBeInTheDocument();
  });

  it('puts the month on the left and the search on the right', () => {
    renderSignedIn(<Transactions />);

    const toolbar = screen.getByText(/ 20\d\d$/).parentElement?.parentElement as HTMLElement;
    expect(toolbar).toContainElement(screen.getByPlaceholderText('Buscar por descrição ou tag'));
    expect(toolbar.style.justifyContent).toBe('space-between');
  });

  it('separates the rows of a day with dividers only between them', () => {
    mockTransactions([
      tx({ id: 's1', date: firstOfMonth, accountId: 'a1', description: 'Primeiro' }),
      tx({ id: 's2', date: firstOfMonth, accountId: 'a1', description: 'Segundo' }),
    ]);

    renderSignedIn(<Transactions />);

    const borders = within(screen.getByTestId('transactions-card'))
      .getAllByRole('listitem')
      .map((item) => item.style.borderTop);
    expect(borders).toEqual(['', '1px solid var(--color-divider)']);
  });
});
