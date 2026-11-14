import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountSheet } from '../../components/AccountSheet/AccountSheet';
import type { Account } from '../../domain/account';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import {
  createAccount,
  deleteAccount,
  setAccountArchived,
  subscribeToAccounts,
} from '../../services/accountsService';
import { createTransaction, subscribeToTransactions } from '../../services/transactionsService';
import { mockSignedInAs, renderSignedIn, testUser } from '../../test-utils';
import { Accounts } from './Accounts';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
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

function mockAccounts(accounts: Account[]) {
  jest.mocked(subscribeToAccounts).mockImplementation((_uid, onChange) => {
    onChange(accounts);
    return jest.fn();
  });
}

describe('Accounts — failures and invalid input', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(testUser);
    jest.mocked(subscribeToTransactions).mockImplementation((_uid, onChange) => {
      onChange([]);
      return jest.fn();
    });
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

  it('does nothing when the form is saved after the session ended', async () => {
    mockAccounts([]);
    mockSignedInAs(null);
    renderSignedIn(<AccountSheet onClose={jest.fn()} />);

    await userEvent.type(screen.getByLabelText('Nome'), 'Carteira');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(createAccount).not.toHaveBeenCalled();
  });
});

describe('useUserData', () => {
  it('refuses to be used outside its provider', () => {
    function Probe() {
      useUserData();
      return null;
    }
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrow('useUserData precisa de um UserDataProvider');
    consoleError.mockRestore();
  });
});
