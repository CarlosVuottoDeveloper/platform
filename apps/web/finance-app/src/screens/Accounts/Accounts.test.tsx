import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import { toCalendarDate } from '../../domain/calendarDate';
import {
  createAccount,
  deleteAccount,
  setAccountArchived,
  subscribeToAccounts,
  updateAccount,
} from '../../services/accountsService';
import { tx } from '../../domain/transaction.test-helpers';
import type { Transaction } from '../../domain/transaction';
import { subscribeToRecurrences } from '../../services/recurrencesService';
import { createTransaction, subscribeToTransactions } from '../../services/transactionsService';
import { mockSignedInAs, money, renderSignedIn, testUser } from '../../test-utils';
import { Accounts } from './Accounts';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/transactionsService');
jest.mock('../../services/recurrencesService');

const account = (overrides: Partial<Account>): Account => ({
  id: 'a1',
  name: 'Nubank',
  type: 'bank',
  color: 'viz-1',
  icon: 'landmark',
  initialBalanceCents: 100000,
  openingDate: '2026-01-01',
  archived: false,
  ...overrides,
});

function mockAccounts(accounts: Account[]) {
  jest.mocked(subscribeToAccounts).mockImplementation((_uid, onChange) => {
    onChange(accounts);
    return jest.fn();
  });
}

function mockTransactions(transactions: Transaction[]) {
  jest.mocked(subscribeToTransactions).mockImplementation((_uid, onChange) => {
    onChange(transactions);
    return jest.fn();
  });
}

const sectionOf = (name: string) => screen.getByRole('region', { name });

describe('Accounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    mockAccounts([]);
    mockTransactions([]);
  });

  it('invites the user to create the first account', () => {
    renderSignedIn(<Accounts />);

    expect(screen.getByText('Nenhuma conta cadastrada')).toBeInTheDocument();
  });

  it('groups accounts into assets, liabilities and archived', () => {
    mockAccounts([
      account({ id: 'a1', name: 'Nubank' }),
      account({ id: 'a2', name: 'Cartão Inter', type: 'credit_card' }),
      account({ id: 'a3', name: 'Conta antiga', archived: true }),
    ]);

    renderSignedIn(<Accounts />);

    expect(within(sectionOf('Ativos')).getByText('Nubank')).toBeInTheDocument();
    expect(within(sectionOf('Passivos')).getByText('Cartão Inter')).toBeInTheDocument();
    expect(within(sectionOf('Arquivadas')).getByText('Conta antiga')).toBeInTheDocument();
    expect(within(sectionOf('Ativos')).getByText('Banco')).toBeInTheDocument();
  });

  it('creates an account with the balance in cents, opening today', async () => {
    jest.mocked(createAccount).mockResolvedValue('new-id');
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova conta' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Nome'), 'Nubank');
    await userEvent.selectOptions(within(dialog).getByLabelText('Tipo'), 'Carteira digital');
    await userEvent.type(within(dialog).getByLabelText('Saldo inicial'), '1.000,50');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(createAccount).toHaveBeenCalledWith(testUser.uid, {
      name: 'Nubank',
      type: 'digital_wallet',
      color: 'viz-1',
      icon: 'landmark',
      initialBalanceCents: 100050,
      openingDate: toCalendarDate(new Date()),
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('stores what is owed on a liability as a negative balance', async () => {
    jest.mocked(createAccount).mockResolvedValue('new-id');
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova conta' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Nome'), 'Cartão');
    await userEvent.selectOptions(within(dialog).getByLabelText('Tipo'), 'Cartão de crédito');
    await userEvent.type(within(dialog).getByLabelText('Saldo devedor inicial'), '500');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(createAccount).toHaveBeenCalledWith(
      testUser.uid,
      expect.objectContaining({ type: 'credit_card', initialBalanceCents: -50000 }),
    );
  });

  it('treats an empty balance as zero', async () => {
    jest.mocked(createAccount).mockResolvedValue('new-id');
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova conta' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Carteira');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(createAccount).toHaveBeenCalledWith(
      testUser.uid,
      expect.objectContaining({ initialBalanceCents: 0 }),
    );
  });

  it('requires a name', async () => {
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova conta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o nome')).toBeInTheDocument();
    expect(createAccount).not.toHaveBeenCalled();
  });

  it('refuses a balance it cannot read', async () => {
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova conta' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Carteira');
    await userEvent.type(screen.getByLabelText('Saldo inicial'), '12abc');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Valor inválido')).toBeInTheDocument();
    expect(createAccount).not.toHaveBeenCalled();
  });

  it('edits an existing account', async () => {
    mockAccounts([account({ id: 'a1', name: 'Nubank' })]);
    jest.mocked(updateAccount).mockResolvedValue();
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Nubank' }));
    const name = screen.getByLabelText('Nome');
    expect(name).toHaveValue('Nubank');
    expect(screen.getByLabelText('Saldo inicial')).toHaveValue('1.000,00');
    await userEvent.clear(name);
    await userEvent.type(name, 'Nu Conta');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateAccount).toHaveBeenCalledWith(testUser.uid, 'a1', {
      name: 'Nu Conta',
      type: 'bank',
      color: 'viz-1',
      icon: 'landmark',
      initialBalanceCents: 100000,
      openingDate: '2026-01-01',
    });
  });

  it('archives an active account and unarchives an archived one', async () => {
    mockAccounts([
      account({ id: 'a1', name: 'Nubank' }),
      account({ id: 'a3', name: 'Conta antiga', archived: true }),
    ]);
    jest.mocked(setAccountArchived).mockResolvedValue();
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Arquivar Nubank' }));
    expect(setAccountArchived).toHaveBeenCalledWith(testUser.uid, 'a1', true);

    await userEvent.click(screen.getByRole('button', { name: 'Desarquivar Conta antiga' }));
    expect(setAccountArchived).toHaveBeenCalledWith(testUser.uid, 'a3', false);
  });

  it('keeps the form open and warns when saving fails', async () => {
    jest.mocked(createAccount).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova conta' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Nubank');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Nubank');
  });

  it('warns when the accounts cannot be loaded', () => {
    jest.mocked(subscribeToAccounts).mockImplementation((_uid, _onChange, onError) => {
      onError('permission-denied');
      return jest.fn();
    });

    renderSignedIn(<Accounts />);

    expect(screen.getByText('Não foi possível carregar seus dados.')).toBeInTheDocument();
  });

  it('closes the form without saving when cancelled', async () => {
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova conta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(createAccount).not.toHaveBeenCalled();
  });

  describe('balances and transfers', () => {
    const nubank = account({ id: 'a1', name: 'Nubank', initialBalanceCents: 100000 });
    const poupanca = account({ id: 'a2', name: 'Poupança', initialBalanceCents: 0 });
    const cartao = account({
      id: 'a3',
      name: 'Cartão',
      type: 'credit_card',
      initialBalanceCents: 0,
    });

    it('shows each balance and a consolidated total that a transfer does not change', () => {
      mockAccounts([nubank, poupanca]);
      mockTransactions([
        tx({
          kind: 'transfer',
          amountCents: 30000,
          date: '2026-01-20',
          accountId: 'a1',
          toAccountId: 'a2',
        }),
      ]);

      renderSignedIn(<Accounts />);

      expect(
        within(screen.getByTestId('account-a1')).getByText(money('R$ 700,00')),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId('account-a2')).getByText(money('R$ 300,00')),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId('consolidated-balance')).getByText(money('R$ 1.000,00')),
      ).toBeInTheDocument();
    });

    it('leaves future movements out of the balance and shows them as upcoming on a liability', () => {
      mockAccounts([cartao]);
      mockTransactions([
        tx({ kind: 'expense', amountCents: 25000, date: '2999-01-01', accountId: 'a3' }),
      ]);

      renderSignedIn(<Accounts />);

      const row = screen.getByTestId('account-a3');
      expect(within(row).getByText(money('R$ 0,00'))).toBeInTheDocument();
      expect(within(row).getByText(money('A vencer: -R$ 250,00'))).toBeInTheDocument();
    });

    it('records a transfer between two accounts', async () => {
      mockAccounts([nubank, poupanca, account({ id: 'a9', name: 'Arquivada', archived: true })]);
      jest.mocked(createTransaction).mockResolvedValue('t-new');
      renderSignedIn(<Accounts />);

      await userEvent.click(screen.getByRole('button', { name: 'Transferir' }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).queryByRole('option', { name: 'Arquivada' })).not.toBeInTheDocument();
      await userEvent.selectOptions(within(dialog).getByLabelText('Origem'), 'Nubank');
      await userEvent.selectOptions(within(dialog).getByLabelText('Destino'), 'Poupança');
      await userEvent.type(within(dialog).getByLabelText('Valor'), '300');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

      expect(createTransaction).toHaveBeenCalledWith(testUser.uid, {
        kind: 'transfer',
        amountCents: 30000,
        date: toCalendarDate(new Date()),
        accountId: 'a1',
        toAccountId: 'a2',
        categoryId: null,
        description: '',
        tags: [],
        recurrenceId: null,
        installment: null,
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('refuses a transfer to the same account, without an amount or before an account opened', async () => {
      mockAccounts([nubank, poupanca]);
      renderSignedIn(<Accounts />);

      await userEvent.click(screen.getByRole('button', { name: 'Transferir' }));
      await userEvent.selectOptions(screen.getByLabelText('Destino'), 'Nubank');
      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(await screen.findByText('Escolha contas diferentes')).toBeInTheDocument();
      expect(screen.getByText('Informe o valor')).toBeInTheDocument();

      await userEvent.selectOptions(screen.getByLabelText('Destino'), 'Poupança');
      await userEvent.type(screen.getByLabelText('Valor'), '10');
      const date = screen.getByLabelText('Data');
      await userEvent.clear(date);
      await userEvent.type(date, '2025-12-31');
      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(await screen.findByText('Data anterior à abertura da conta')).toBeInTheDocument();
      expect(createTransaction).not.toHaveBeenCalled();
    });

    it('only offers a transfer when there are two active accounts', () => {
      mockAccounts([nubank]);

      renderSignedIn(<Accounts />);

      expect(screen.getByRole('button', { name: 'Transferir' })).toBeDisabled();
    });

    it('lets an account without movements be deleted after confirmation', async () => {
      mockAccounts([nubank, poupanca]);
      mockTransactions([tx({ kind: 'income', accountId: 'a1' })]);
      jest.mocked(deleteAccount).mockResolvedValue();
      renderSignedIn(<Accounts />);

      expect(screen.queryByRole('button', { name: 'Excluir Nubank' })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Excluir Poupança' }));
      expect(deleteAccount).not.toHaveBeenCalled();
      await userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
      );

      expect(deleteAccount).toHaveBeenCalledWith(testUser.uid, 'a2');
    });
  });

  it('refuses an opening date later than a movement the account already has', async () => {
    mockAccounts([account({ id: 'a1', name: 'Nubank' }), account({ id: 'a2', name: 'Poupança' })]);
    mockTransactions([
      tx({ kind: 'transfer', date: '2026-02-10', accountId: 'a2', toAccountId: 'a1' }),
      tx({ kind: 'expense', date: '2026-05-01', accountId: 'a1' }),
    ]);
    jest.mocked(updateAccount).mockResolvedValue();
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Nubank' }));
    const openingDate = screen.getByLabelText('Data de abertura');
    await userEvent.clear(openingDate);
    await userEvent.type(openingDate, '2026-02-11');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Há movimentações antes dessa data (a primeira é de 10/02/2026)'),
    ).toBeInTheDocument();
    expect(updateAccount).not.toHaveBeenCalled();

    await userEvent.clear(openingDate);
    await userEvent.type(openingDate, '2026-02-10');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateAccount).toHaveBeenCalledWith(
      testUser.uid,
      'a1',
      expect.objectContaining({ openingDate: '2026-02-10' }),
    );
  });

  it('warns when archiving or deleting fails', async () => {
    mockAccounts([account({ id: 'a1', name: 'Nubank' })]);
    jest.mocked(setAccountArchived).mockRejectedValue({ code: 'unavailable' });
    jest.mocked(deleteAccount).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Arquivar Nubank' }));
    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Nubank' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );
    expect(await screen.findAllByText('Não foi possível salvar.')).toHaveLength(2);
  });

  it('keeps the transfer form open and warns when saving fails', async () => {
    mockAccounts([account({ id: 'a1', name: 'Nubank' }), account({ id: 'a2', name: 'Poupança' })]);
    jest.mocked(createTransaction).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Transferir' }));
    await userEvent.type(screen.getByLabelText('Valor'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('asks for a real date in the transfer and opening-date fields', async () => {
    mockAccounts([account({ id: 'a1', name: 'Nubank' }), account({ id: 'a2', name: 'Poupança' })]);
    renderSignedIn(<Accounts />);

    await userEvent.click(screen.getByRole('button', { name: 'Transferir' }));
    await userEvent.type(screen.getByLabelText('Valor'), '10');
    await userEvent.clear(screen.getByLabelText('Data'));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Informe a data')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await userEvent.click(screen.getByRole('button', { name: 'Nova conta' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Carteira');
    await userEvent.clear(screen.getByLabelText('Data de abertura'));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Informe a data de abertura')).toBeInTheDocument();
    expect(createAccount).not.toHaveBeenCalled();
  });

  it('does not offer to delete an account that a recurring rule still uses', () => {
    mockAccounts([account({ id: 'a1', name: 'Nubank' })]);
    jest.mocked(subscribeToRecurrences).mockImplementation((_uid, onChange) => {
      onChange([
        {
          id: 'r1',
          kind: 'expense',
          amountCents: 100,
          dayOfMonth: 5,
          accountId: 'a1',
          categoryId: 'c1',
          description: 'Aluguel',
          tags: [],
          startMonth: '2026-01',
          endMonth: null,
          materializedThrough: null,
        },
      ]);
      return jest.fn();
    });

    renderSignedIn(<Accounts />);

    expect(screen.queryByRole('button', { name: 'Excluir Nubank' })).not.toBeInTheDocument();
  });
});
