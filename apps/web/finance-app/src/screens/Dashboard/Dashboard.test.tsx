import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import type { Recurrence } from '../../domain/recurrence';
import { tx } from '../../domain/transaction.test-helpers';
import type { Transaction } from '../../domain/transaction';
import { subscribeToAccounts } from '../../services/accountsService';
import { subscribeToBudgets } from '../../services/budgetsService';
import { seedDefaultCategories, subscribeToCategories } from '../../services/categoriesService';
import {
  materializeDueRecurrences,
  subscribeToRecurrences,
} from '../../services/recurrencesService';
import { subscribeToTransactions } from '../../services/transactionsService';
import { mockSignedInAs, mockWideScreen, money, renderSignedIn, testUser } from '../../test-utils';
import { Dashboard } from './Dashboard';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/budgetsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/transactionsService');
jest.mock('../../services/recurrencesService');

const account: Account = {
  id: 'a',
  name: 'Nubank',
  type: 'bank',
  color: 'viz-1',
  icon: 'landmark',
  initialBalanceCents: 0,
  openingDate: '2026-01-01',
  archived: false,
};
const categories = [
  { id: 'c1', name: 'Moradia', kind: 'expense', archived: false },
  { id: 'c2', name: 'Salário', kind: 'income', archived: false },
] as Category[];
const rent: Recurrence = {
  id: 'r1',
  kind: 'expense',
  amountCents: 50000,
  dayOfMonth: 25,
  accountId: 'a',
  categoryId: 'c1',
  description: 'Aluguel',
  tags: [],
  startMonth: '2026-01',
  endMonth: null,
  materializedThrough: '2026-02',
};
const marchTransactions = [
  tx({
    id: 'm1',
    kind: 'income',
    amountCents: 115000,
    date: '2026-03-05',
    accountId: 'a',
    categoryId: 'c2',
    description: 'Salário de março',
  }),
  tx({
    id: 'm2',
    kind: 'expense',
    amountCents: 15000,
    date: '2026-03-12',
    accountId: 'a',
    categoryId: 'c1',
    description: 'Mercado',
  }),
  tx({
    id: 'm3',
    kind: 'expense',
    amountCents: 20000,
    date: '2026-03-20',
    accountId: 'a',
    categoryId: 'c1',
    description: 'Conta futura',
  }),
  tx({
    id: 'f1',
    kind: 'income',
    amountCents: 80000,
    date: '2026-02-03',
    accountId: 'a',
    categoryId: 'c2',
    description: 'Salário de fevereiro',
  }),
];

function publish<T>(items: T[]) {
  return (_uid: string, onChange: (items: T[]) => void) => {
    onChange(items);
    return jest.fn();
  };
}

function mockData(accounts: Account[], transactions: Transaction[], recurrences: Recurrence[]) {
  jest.mocked(subscribeToAccounts).mockImplementation(publish(accounts));
  jest.mocked(subscribeToTransactions).mockImplementation(publish(transactions));
  jest.mocked(subscribeToRecurrences).mockImplementation(publish(recurrences));
}

const tile = (testId: string) => within(screen.getByTestId(testId));

describe('Dashboard', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    mockSignedInAs(testUser);
    mockWideScreen(false);
    jest.mocked(seedDefaultCategories).mockResolvedValue();
    jest.mocked(materializeDueRecurrences).mockResolvedValue();
    jest.mocked(subscribeToCategories).mockImplementation(publish(categories));
    jest.mocked(subscribeToBudgets).mockImplementation(publish([]));
    mockData([account], marchTransactions, [rent]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('summarises the current month: balance, income, expenses and expected balance', () => {
    renderSignedIn(<Dashboard />);

    expect(screen.getByText('Março 2026')).toBeInTheDocument();
    expect(tile('summary-balance').getByText(money('R$ 1.800,00'))).toBeInTheDocument();
    expect(tile('summary-income').getByText(money('R$ 1.150,00'))).toBeInTheDocument();
    expect(tile('summary-expense').getByText(money('R$ 150,00'))).toBeInTheDocument();
    expect(tile('summary-expected').getByText(money('R$ 1.100,00'))).toBeInTheDocument();
  });

  it('lists the latest realised movements, most recent first, without upcoming ones', () => {
    renderSignedIn(<Dashboard />);

    const latest = within(screen.getByRole('region', { name: 'Últimas movimentações' }));
    expect(latest.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Mercado'),
      expect.stringContaining('Salário de março'),
      expect.stringContaining('Salário de fevereiro'),
    ]);
    expect(latest.queryByText('Conta futura')).not.toBeInTheDocument();
  });

  it('shows at most five latest movements', () => {
    const many = Array.from({ length: 8 }, (_, index) =>
      tx({
        id: `x${index}`,
        date: `2026-03-0${index + 1}`,
        accountId: 'a',
        description: `Item ${index}`,
      }),
    );
    mockData([account], many, []);

    renderSignedIn(<Dashboard />);

    expect(
      within(screen.getByRole('region', { name: 'Últimas movimentações' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(5);
  });

  it('shows a past month as it closed', async () => {
    renderSignedIn(<Dashboard />);

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(screen.getByText('Fevereiro 2026')).toBeInTheDocument();
    expect(tile('summary-income').getByText(money('R$ 800,00'))).toBeInTheDocument();
    expect(tile('summary-expense').getByText(money('R$ 0,00'))).toBeInTheDocument();
    expect(tile('summary-balance').getByText(money('R$ 800,00'))).toBeInTheDocument();
  });

  it('invites a new user to create the first account', () => {
    mockData([], [], []);

    renderSignedIn(<Dashboard />);

    expect(screen.getByText('Comece cadastrando uma conta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastrar conta' })).toHaveAttribute(
      'href',
      '/contas',
    );
  });

  it('lists the budgets that are near or over their limit this month', () => {
    jest.mocked(subscribeToBudgets).mockImplementation(
      publish([
        { id: 'c1', categoryId: 'c1', limitCents: 100000 },
        { id: 'c2', categoryId: 'c2', limitCents: 100000 },
      ]),
    );

    renderSignedIn(<Dashboard />);

    const alerts = within(screen.getByRole('region', { name: 'Orçamentos em alerta' }));
    expect(alerts.getByText('Moradia')).toBeInTheDocument();
    expect(alerts.getByText('Perto do limite')).toBeInTheDocument();
    expect(alerts.queryByText('Salário')).not.toBeInTheDocument();
  });

  it('shows no budget alert section when every budget is fine', () => {
    jest
      .mocked(subscribeToBudgets)
      .mockImplementation(publish([{ id: 'c1', categoryId: 'c1', limitCents: 1000000 }]));

    renderSignedIn(<Dashboard />);

    expect(screen.queryByRole('region', { name: 'Orçamentos em alerta' })).not.toBeInTheDocument();
  });

  it('names a movement without description by its category, or as a transfer', () => {
    mockData(
      [account],
      [
        tx({
          id: 'n1',
          kind: 'expense',
          date: '2026-03-02',
          accountId: 'a',
          categoryId: 'c1',
          description: '',
        }),
        tx({
          id: 'n2',
          kind: 'transfer',
          date: '2026-03-01',
          accountId: 'a',
          toAccountId: 'b',
          description: '',
        }),
      ],
      [],
    );

    renderSignedIn(<Dashboard />);

    const latest = within(screen.getByRole('region', { name: 'Últimas movimentações' }));
    expect(latest.getByText('Moradia')).toBeInTheDocument();
    expect(latest.getByText('Transferência')).toBeInTheDocument();
  });

  it('says so when there are no movements yet', () => {
    mockData([account], [], []);

    renderSignedIn(<Dashboard />);

    expect(screen.getByText('Nenhuma movimentação ainda.')).toBeInTheDocument();
  });

  it('leaves out alerts of budgets whose category was archived or removed', () => {
    jest
      .mocked(subscribeToCategories)
      .mockImplementation(
        publish([{ ...categories[0], archived: true } as Category, categories[1] as Category]),
      );
    jest.mocked(subscribeToBudgets).mockImplementation(
      publish([
        { id: 'c1', categoryId: 'c1', limitCents: 1000 },
        { id: 'gone', categoryId: 'gone', limitCents: 1000 },
      ]),
    );

    renderSignedIn(<Dashboard />);

    expect(screen.queryByRole('region', { name: 'Orçamentos em alerta' })).not.toBeInTheDocument();
  });

  describe('wireframe layout', () => {
    it('highlights the overall balance on the primary surface', () => {
      renderSignedIn(<Dashboard />);

      const card = screen.getByTestId('summary-balance-card');
      expect(card.style.background).toContain('var(--gradient-primary)');
      expect(card).toContainElement(screen.getByTestId('summary-balance'));
      expect(tile('summary-balance').getByText('Saldo geral').style.color).toBe(
        'var(--color-text)',
      );
      expect(screen.getByTestId('summary-income-card').style.background).toContain(
        'var(--gradient-surface)',
      );
    });

    it.each([
      [true, 'repeat(4, 1fr)', '2fr 1fr'],
      [false, '1fr', '1fr'],
    ])('lays out tiles and columns for the screen width (wide: %s)', (isWide, tiles, columns) => {
      mockWideScreen(isWide);

      renderSignedIn(<Dashboard />);

      expect(screen.getByTestId('summary-tiles').style.gridTemplateColumns).toBe(tiles);
      expect(screen.getByTestId('dashboard-columns').style.gridTemplateColumns).toBe(columns);
    });

    it('dates each latest movement and links to the full list', () => {
      renderSignedIn(<Dashboard />);

      const latest = within(screen.getByRole('region', { name: 'Últimas movimentações' }));
      expect(latest.getByText('12/03/2026 · Moradia · Nubank')).toBeInTheDocument();
      expect(latest.getByRole('link', { name: 'Ver todas' })).toHaveAttribute(
        'href',
        '/transacoes',
      );
      expect(latest.queryByRole('button')).not.toBeInTheDocument();
    });

    it('gives each card a section heading for screen readers', () => {
      jest
        .mocked(subscribeToBudgets)
        .mockImplementation(publish([{ id: 'c1', categoryId: 'c1', limitCents: 100000 }]));

      renderSignedIn(<Dashboard />);

      for (const name of [
        'Últimas movimentações',
        'Orçamentos em alerta',
        'Despesas por categoria',
      ]) {
        expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
      }
    });

    it('separates latest movements and budget alerts with dividers only between rows', () => {
      jest
        .mocked(subscribeToCategories)
        .mockImplementation(
          publish([
            ...categories,
            { id: 'c3', name: 'Lazer', kind: 'expense', archived: false } as Category,
          ]),
        );
      mockData(
        [account],
        [
          ...marchTransactions,
          tx({
            id: 'l1',
            kind: 'expense',
            amountCents: 5000,
            date: '2026-03-11',
            accountId: 'a',
            categoryId: 'c3',
          }),
        ],
        [rent],
      );
      jest.mocked(subscribeToBudgets).mockImplementation(
        publish([
          { id: 'c1', categoryId: 'c1', limitCents: 100000 },
          { id: 'c3', categoryId: 'c3', limitCents: 1000 },
        ]),
      );

      renderSignedIn(<Dashboard />);

      for (const region of ['Últimas movimentações', 'Orçamentos em alerta']) {
        const items = within(screen.getByRole('region', { name: region })).getAllByRole('listitem');
        expect(items.map((item) => item.style.borderBottom)).toEqual(items.map(() => ''));
        expect(items[0]?.style.borderTop).toBe('');
        expect(items[1]?.style.borderTop).toBe('1px solid var(--color-divider)');
      }
    });

    it('keeps the card links on one line without underline', () => {
      renderSignedIn(<Dashboard />);

      const link = screen.getByRole('link', { name: 'Ver todas' });
      expect(link.style.whiteSpace).toBe('nowrap');
      expect(link.style.textDecoration).toBe('none');
    });

    it('tints the income icon green and the expense icon red', async () => {
      renderSignedIn(<Dashboard />);

      const incomeIcon = screen.getByTestId('summary-income-icon');
      const expenseIcon = screen.getByTestId('summary-expense-icon');
      await waitFor(() => expect(incomeIcon.querySelector('svg')).not.toBeNull());
      await waitFor(() => expect(expenseIcon.querySelector('svg')).not.toBeNull());
      expect(incomeIcon.querySelector('svg')?.style.color).toBe('var(--color-success-300)');
      expect(expenseIcon.querySelector('svg')?.style.color).toBe('var(--color-danger-300)');
    });

    it('links the budget alerts to the budgets screen', () => {
      jest
        .mocked(subscribeToBudgets)
        .mockImplementation(publish([{ id: 'c1', categoryId: 'c1', limitCents: 100000 }]));

      renderSignedIn(<Dashboard />);

      const alerts = within(screen.getByRole('region', { name: 'Orçamentos em alerta' }));
      expect(alerts.getByRole('link', { name: 'Ver orçamentos' })).toHaveAttribute(
        'href',
        '/orcamentos',
      );
    });

    it('breaks down the month expenses by category up to today', () => {
      renderSignedIn(<Dashboard />);

      const spending = within(screen.getByRole('region', { name: 'Despesas por categoria' }));
      expect(spending.getByText('Total')).toBeInTheDocument();
      expect(spending.getByText(money('R$ 150,00'))).toBeInTheDocument();
      expect(spending.getByRole('button', { name: /Moradia/ })).toBeInTheDocument();
    });

    it('shows no breakdown for a month with only upcoming expenses', async () => {
      renderSignedIn(<Dashboard />);

      await user.click(screen.getByRole('button', { name: 'Próximo mês' }));

      const spending = within(screen.getByRole('region', { name: 'Despesas por categoria' }));
      expect(spending.getByText('Sem despesas neste mês')).toBeInTheDocument();
    });
  });
});
