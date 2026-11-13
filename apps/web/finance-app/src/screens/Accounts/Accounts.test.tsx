import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import { toCalendarDate } from '../../domain/calendarDate';
import {
  createAccount,
  setAccountArchived,
  subscribeToAccounts,
  updateAccount,
} from '../../services/accountsService';
import { mockSignedInAs, renderSignedIn, testUser } from '../../test-utils';
import { Accounts } from './Accounts';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');

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

const sectionOf = (name: string) => screen.getByRole('region', { name });

describe('Accounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    mockAccounts([]);
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
});
