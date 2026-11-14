import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import { tx } from '../../domain/transaction.test-helpers';
import {
  mockSignedInAs,
  mockUserData,
  mockWideScreen,
  money,
  renderSignedIn,
  testUser,
} from '../../test-utils';
import { Reports } from './Reports';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/budgetsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/exportService');
jest.mock('../../services/goalsService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

const accounts = [
  {
    id: 'a',
    name: 'Nubank',
    type: 'bank',
    color: 'viz-1',
    icon: 'landmark',
    initialBalanceCents: 100000,
    openingDate: '2026-01-01',
    archived: false,
  },
] as Account[];
const categories = [
  { id: 'c1', name: 'Alimentação', kind: 'expense', color: 'viz-5', archived: false },
  { id: 'c2', name: 'Moradia', kind: 'expense', color: 'viz-1', archived: false },
  { id: 'c3', name: 'Salário', kind: 'income', color: 'viz-3', archived: false },
] as Category[];
const transactions = [
  tx({ kind: 'income', amountCents: 500000, date: '2026-03-05', accountId: 'a', categoryId: 'c3' }),
  tx({
    kind: 'expense',
    amountCents: 150000,
    date: '2026-03-06',
    accountId: 'a',
    categoryId: 'c2',
  }),
  tx({ kind: 'expense', amountCents: 50000, date: '2026-03-10', accountId: 'a', categoryId: 'c1' }),
  tx({ kind: 'expense', amountCents: 30000, date: '2026-02-10', accountId: 'a', categoryId: 'c1' }),
];

const plain = (text: string | null) => (text ?? '').replace(/\s/g, ' ');
const chartLabels = () =>
  screen.getAllByRole('img').map((chart) => plain(chart.getAttribute('aria-label')));

describe('Reports — charts', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    mockSignedInAs(testUser);
    mockUserData({ accounts, categories, transactions });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows how the month was spent by category', () => {
    renderSignedIn(<Reports />);

    expect(chartLabels()).toContain('Moradia 75%, Alimentação 25%');
    expect(
      screen.getByRole('button', { name: (name) => plain(name) === 'Moradia: R$ 1.500,00, 75%' }),
    ).toBeInTheDocument();
  });

  it('compares income and expenses over the last six months', () => {
    renderSignedIn(<Reports />);

    const cashFlow = chartLabels().find((label) => label.startsWith('out/25'));
    expect(cashFlow).toContain('fev/26: Receitas R$ 0,00, Despesas R$ 300,00');
    expect(cashFlow).toContain('mar/26: Receitas R$ 5.000,00, Despesas R$ 2.000,00');
    expect(cashFlow?.split(';')).toHaveLength(6);
  });

  it('plots the consolidated balance day by day up to today', () => {
    renderSignedIn(<Reports />);

    const balance = chartLabels().find((label) => label.startsWith('01 '));
    expect(balance).toContain('01 R$ 700,00');
    expect(balance).toContain('15 R$ 3.700,00');
    expect(balance).not.toContain('16 ');
  });

  it('counts in the pie only what was already spent, like the bars and the dashboard', () => {
    mockUserData({
      accounts,
      categories,
      transactions: [
        ...transactions,
        tx({
          kind: 'expense',
          amountCents: 800000,
          date: '2026-03-28',
          accountId: 'a',
          categoryId: 'c1',
        }),
      ],
    });

    renderSignedIn(<Reports />);

    expect(chartLabels()).toContain('Moradia 75%, Alimentação 25%');
  });

  it('follows the selected month', async () => {
    renderSignedIn(<Reports />);

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(chartLabels()).toContain('Alimentação 100%');
  });

  it('explains when there is nothing to plot', () => {
    mockUserData({ accounts: [], categories, transactions: [] });

    renderSignedIn(<Reports />);

    expect(screen.getByText('Sem despesas neste mês')).toBeInTheDocument();
    expect(screen.getByText('Sem movimentações nos últimos meses')).toBeInTheDocument();
    expect(screen.getByText('Cadastre uma conta para ver a evolução do saldo')).toBeInTheDocument();
  });
});

describe('Reports — net worth', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const card = {
    ...accounts[0],
    id: 'k',
    name: 'Cartão',
    type: 'credit_card',
    initialBalanceCents: -80000,
  } as Account;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    mockSignedInAs(testUser);
    mockUserData({ accounts: [...accounts, card], categories, transactions });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens on the charts tab and switches to net worth', async () => {
    renderSignedIn(<Reports />);

    expect(screen.getByRole('tab', { name: 'Gráficos' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: 'Patrimônio' }));

    expect(screen.getByRole('tab', { name: 'Patrimônio' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByText('Despesas por categoria')).not.toBeInTheDocument();
  });

  it('shows assets, liabilities and net worth as of today', async () => {
    renderSignedIn(<Reports />);
    await user.click(screen.getByRole('tab', { name: 'Patrimônio' }));

    expect(
      within(screen.getByTestId('net-worth-assets')).getByText(money('R$ 3.700,00')),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('net-worth-liabilities')).getByText(money('R$ 800,00')),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('net-worth-net')).getByText(money('R$ 2.900,00')),
    ).toBeInTheDocument();
  });

  it('plots net worth month by month since the oldest account', async () => {
    renderSignedIn(<Reports />);
    await user.click(screen.getByRole('tab', { name: 'Patrimônio' }));

    const label = plain(screen.getByRole('img').getAttribute('aria-label'));
    expect(label).toBe('jan/26 R$ 200,00, fev/26 -R$ 100,00, mar/26 R$ 2.900,00');
  });

  it('asks for an account when there is none', async () => {
    mockUserData({ accounts: [] });
    renderSignedIn(<Reports />);

    await user.click(screen.getByRole('tab', { name: 'Patrimônio' }));

    expect(
      screen.getByText('Cadastre uma conta para acompanhar seu patrimônio'),
    ).toBeInTheDocument();
  });
});

describe('Reports — tabs and edge months', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    mockSignedInAs(testUser);
    mockUserData({ accounts, categories, transactions });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens the filtered report tab', async () => {
    renderSignedIn(<Reports />);

    await user.click(screen.getByRole('tab', { name: 'Relatório' }));

    expect(screen.getByLabelText('De')).toHaveValue('2026-03-01');
  });

  it('explains that a future month has no balance history yet', async () => {
    renderSignedIn(<Reports />);

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(screen.getByText('Este mês ainda não começou')).toBeInTheDocument();
  });
});

describe('Reports — wireframe layout', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));
    mockSignedInAs(testUser);
    mockWideScreen(false);
    mockUserData({ accounts, categories, transactions });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('puts the month beside the tabs, only on the charts tab', async () => {
    renderSignedIn(<Reports />);

    const tabsRow = screen.getByRole('tablist').parentElement as HTMLElement;
    expect(within(tabsRow).getByText('Março 2026')).toBeInTheDocument();
    expect(tabsRow.style.justifyContent).toBe('space-between');

    await user.click(screen.getByRole('tab', { name: 'Patrimônio' }));

    expect(screen.queryByRole('button', { name: 'Mês anterior' })).not.toBeInTheDocument();
  });

  it('keeps the chosen month when coming back to the charts tab', async () => {
    renderSignedIn(<Reports />);

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));
    await user.click(screen.getByRole('tab', { name: 'Patrimônio' }));
    await user.click(screen.getByRole('tab', { name: 'Gráficos' }));

    expect(screen.getByText('Fevereiro 2026')).toBeInTheDocument();
  });

  it('shows the spending total in the middle of the pie', () => {
    renderSignedIn(<Reports />);

    const pieCard = screen.getByTestId('spending-card');
    expect(within(pieCard).getByText('Total')).toBeInTheDocument();
    expect(within(pieCard).getByText(money('R$ 2.000,00'))).toBeInTheDocument();
  });

  it.each([
    [true, 'row'],
    [false, 'column'],
  ])('places the pie legend for the screen width (wide: %s)', (isWide, direction) => {
    mockWideScreen(isWide);

    renderSignedIn(<Reports />);

    const pie = screen.getByTestId('spending-pie');
    expect(pie.style.flexDirection).toBe(direction);
  });
});
