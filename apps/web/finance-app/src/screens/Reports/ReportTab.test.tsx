import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import { tx } from '../../domain/transaction.test-helpers';
import { downloadCsv, downloadPdf, downloadXlsx } from '../../services/exportService';
import { mockSignedInAs, mockUserData, money, renderSignedIn, testUser } from '../../test-utils';
import { ReportTab } from './ReportTab';

jest.mock('../../services/authService');
jest.mock('../../services/accountsService');
jest.mock('../../services/budgetsService');
jest.mock('../../services/categoriesService');
jest.mock('../../services/exportService');
jest.mock('../../services/goalsService');
jest.mock('../../services/recurrencesService');
jest.mock('../../services/transactionsService');

const accounts = [
  { id: 'a1', name: 'Nubank', type: 'bank', archived: false },
  { id: 'a2', name: 'Conta antiga', type: 'bank', archived: true },
] as Account[];
const categories = [
  { id: 'c1', name: 'Alimentação', kind: 'expense', archived: false },
  { id: 'c2', name: 'Salário', kind: 'income', archived: false },
] as Category[];
const transactions = [
  tx({
    id: 'e',
    kind: 'expense',
    amountCents: 123456,
    date: '2026-03-10',
    accountId: 'a1',
    categoryId: 'c1',
    description: 'Mercado',
    tags: ['casa'],
  }),
  tx({
    id: 'i',
    kind: 'income',
    amountCents: 500000,
    date: '2026-03-05',
    accountId: 'a2',
    categoryId: 'c2',
    description: 'Pagamento',
  }),
  tx({
    id: 't',
    kind: 'transfer',
    amountCents: 30000,
    date: '2026-03-07',
    accountId: 'a1',
    toAccountId: 'a2',
  }),
  tx({
    id: 'f',
    kind: 'expense',
    amountCents: 9900,
    date: '2026-02-10',
    accountId: 'a1',
    categoryId: 'c1',
    description: 'Fevereiro',
  }),
];

const dataRows = () => screen.getAllByRole('row').slice(1);

describe('ReportTab', () => {
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

  it('starts with the current month up to today, ordered by date, with totals', () => {
    renderSignedIn(<ReportTab />);

    expect(screen.getByLabelText('De')).toHaveValue('2026-03-01');
    expect(screen.getByLabelText('Até')).toHaveValue('2026-03-15');
    expect(dataRows().map((row) => within(row).getAllByRole('cell')[2]?.textContent)).toEqual([
      'Pagamento',
      '',
      'Mercado',
    ]);
    expect(
      within(screen.getByTestId('report-totals')).getByText(money('Receitas: R$ 5.000,00')),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('report-totals')).getByText(money('Despesas: R$ 1.234,56')),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('report-totals')).getByText(money('Saldo: R$ 3.765,44')),
    ).toBeInTheDocument();
  });

  it('filters by an archived account, including transfers that touch it', async () => {
    renderSignedIn(<ReportTab />);

    await user.selectOptions(screen.getByLabelText('Conta'), 'Conta antiga');

    expect(dataRows()).toHaveLength(2);
    expect(within(dataRows()[0] as HTMLElement).getByText('Conta antiga')).toBeInTheDocument();
    expect(within(dataRows()[1] as HTMLElement).getByText('Transferência')).toBeInTheDocument();
  });

  it('filters by category, kind, tag and period', async () => {
    renderSignedIn(<ReportTab />);

    await user.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação');
    expect(dataRows()).toHaveLength(1);

    fireEvent.change(screen.getByLabelText('De'), { target: { value: '2026-02-01' } });
    expect(dataRows()).toHaveLength(2);

    await user.selectOptions(screen.getByLabelText('Tag'), 'casa');
    expect(dataRows()).toHaveLength(1);

    await user.selectOptions(screen.getByLabelText('Categoria'), 'Todas');
    await user.selectOptions(screen.getByLabelText('Tag'), 'Todas');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'Transferências');
    expect(dataRows()).toHaveLength(1);
  });

  it('says when nothing matches and disables the exports', async () => {
    renderSignedIn(<ReportTab />);

    fireEvent.change(screen.getByLabelText('De'), { target: { value: '2030-01-01' } });

    expect(screen.getByText('Nenhuma movimentação com esses filtros')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CSV' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Excel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled();
  });

  it('exports the filtered rows as CSV, Excel and PDF', async () => {
    jest.mocked(downloadXlsx).mockResolvedValue();
    jest.mocked(downloadPdf).mockResolvedValue();
    renderSignedIn(<ReportTab />);
    await user.selectOptions(screen.getByLabelText('Tipo'), 'Despesas');

    await user.click(screen.getByRole('button', { name: 'CSV' }));
    expect(downloadCsv).toHaveBeenCalledWith(
      [
        ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Conta destino', 'Valor', 'Tags'],
        ['10/03/2026', 'Despesa', 'Mercado', 'Alimentação', 'Nubank', '', '1234,56', 'casa'],
      ],
      'relatorio-2026-03-01-a-2026-03-15.csv',
    );

    await user.click(screen.getByRole('button', { name: 'Excel' }));
    expect(downloadXlsx).toHaveBeenCalledWith(
      [expect.objectContaining({ description: 'Mercado', amountCents: 123456 })],
      'relatorio-2026-03-01-a-2026-03-15.xlsx',
    );

    await user.click(screen.getByRole('button', { name: 'PDF' }));
    expect(downloadPdf).toHaveBeenCalledWith(
      'Relatório de 01/03/2026 a 15/03/2026',
      expect.arrayContaining([expect.arrayContaining(['Mercado'])]),
      [
        expect.stringMatching(/^Receitas:/),
        expect.stringMatching(/^Despesas:/),
        expect.stringMatching(/^Saldo:/),
      ],
      'relatorio-2026-03-01-a-2026-03-15.pdf',
    );
  });

  it('warns when an export fails', async () => {
    jest.mocked(downloadXlsx).mockRejectedValue(new Error('boom'));
    renderSignedIn(<ReportTab />);

    await user.click(screen.getByRole('button', { name: 'Excel' }));

    expect(await screen.findByText('Não foi possível exportar.')).toBeInTheDocument();
  });
});
