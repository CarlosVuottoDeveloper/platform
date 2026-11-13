import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Category } from '../../domain/category';
import { tx } from '../../domain/transaction.test-helpers';
import { deleteBudget, setBudget } from '../../services/budgetsService';
import { mockSignedInAs, mockUserData, money, renderSignedIn, testUser } from '../../test-utils';
import { Budgets } from './Budgets';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/budgetsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

const categories = [
  { id: 'c1', name: 'Alimentação', kind: 'expense', archived: false },
  { id: 'c2', name: 'Lazer', kind: 'expense', archived: false },
  { id: 'c3', name: 'Transporte', kind: 'expense', archived: false },
  { id: 'c4', name: 'Antiga', kind: 'expense', archived: true },
  { id: 'c5', name: 'Salário', kind: 'income', archived: false },
] as Category[];
const budgets = [
  { id: 'c1', categoryId: 'c1', limitCents: 100000 },
  { id: 'c2', categoryId: 'c2', limitCents: 50000 },
  { id: 'c4', categoryId: 'c4', limitCents: 10000 },
];
const transactions = [
  tx({ kind: 'expense', amountCents: 85000, date: '2026-03-10', categoryId: 'c1' }),
  tx({ kind: 'expense', amountCents: 30000, date: '2026-03-28', categoryId: 'c2' }),
  tx({ kind: 'expense', amountCents: 20000, date: '2026-02-10', categoryId: 'c2' }),
];
const rent = {
  id: 'r1',
  kind: 'expense' as const,
  amountCents: 25000,
  dayOfMonth: 25,
  accountId: 'a',
  categoryId: 'c2',
  description: 'Streaming',
  tags: [],
  startMonth: '2026-01',
  endMonth: null,
  materializedThrough: '2026-02',
};

const row = (categoryId: string) => within(screen.getByTestId(`budget-${categoryId}`));

describe('Budgets', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    mockSignedInAs(testUser);
    mockUserData({ categories, budgets, transactions, recurrences: [rent] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows progress against each limit for the current month', () => {
    renderSignedIn(<Budgets />);

    expect(row('c1').getByText(money('R$ 850,00 de R$ 1.000,00'))).toBeInTheDocument();
    expect(row('c1').getByText('Perto do limite')).toBeInTheDocument();
  });

  it('counts upcoming and forecast expenses so the alert comes early', () => {
    renderSignedIn(<Budgets />);

    expect(row('c2').getByText(money('R$ 550,00 de R$ 500,00'))).toBeInTheDocument();
    expect(row('c2').getByText('Limite estourado')).toBeInTheDocument();
  });

  it('lists active expense categories without a limit and hides archived and income ones', () => {
    renderSignedIn(<Budgets />);

    expect(row('c3').getByText('Sem teto definido')).toBeInTheDocument();
    expect(screen.queryByTestId('budget-c4')).not.toBeInTheDocument();
    expect(screen.queryByTestId('budget-c5')).not.toBeInTheDocument();
  });

  it('recalculates for another month', async () => {
    renderSignedIn(<Budgets />);

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(row('c2').getByText(money('R$ 200,00 de R$ 500,00'))).toBeInTheDocument();
    expect(row('c2').queryByText('Limite estourado')).not.toBeInTheDocument();
  });

  it('sets a limit for a category', async () => {
    jest.mocked(setBudget).mockResolvedValue();
    renderSignedIn(<Budgets />);

    await user.click(screen.getByRole('button', { name: 'Definir teto de Transporte' }));
    await user.type(screen.getByLabelText('Teto mensal'), '300');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(setBudget).toHaveBeenCalledWith(testUser.uid, 'c3', 30000);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('changes and removes an existing limit', async () => {
    jest.mocked(setBudget).mockResolvedValue();
    jest.mocked(deleteBudget).mockResolvedValue();
    renderSignedIn(<Budgets />);

    await user.click(screen.getByRole('button', { name: 'Alterar teto de Alimentação' }));
    const limit = screen.getByLabelText('Teto mensal');
    expect(limit).toHaveValue('1.000,00');
    await user.clear(limit);
    await user.type(limit, '1.200');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(setBudget).toHaveBeenCalledWith(testUser.uid, 'c1', 120000);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Alterar teto de Alimentação' }));
    await user.click(screen.getByRole('button', { name: 'Remover teto' }));
    expect(deleteBudget).toHaveBeenCalledWith(testUser.uid, 'c1');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('requires a positive limit and warns when saving fails', async () => {
    jest.mocked(setBudget).mockRejectedValue({ code: 'unavailable' });
    renderSignedIn(<Budgets />);

    await user.click(screen.getByRole('button', { name: 'Definir teto de Transporte' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Informe o teto')).toBeInTheDocument();
    expect(setBudget).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Teto mensal'), '300');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
  });

  it('explains what to do when there are no expense categories', () => {
    mockUserData({ categories: [] });

    renderSignedIn(<Budgets />);

    expect(screen.getByText('Nenhuma categoria de despesa')).toBeInTheDocument();
  });
});
