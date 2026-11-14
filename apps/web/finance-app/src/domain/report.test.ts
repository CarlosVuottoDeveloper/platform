import type { Account } from './account';
import type { Category } from './category';
import { filterTransactions, reportEntries, reportRows, reportTotals } from './report';
import type { ReportFilter } from './report';
import { tx } from './transaction.test-helpers';

const accounts = [
  { id: 'a1', name: 'Nubank', archived: false },
  { id: 'a2', name: 'Conta antiga', archived: true },
] as Account[];
const categories = [
  { id: 'c1', name: 'Alimentação', archived: false },
  { id: 'c2', name: 'Salário', archived: false },
] as Category[];

const expense = tx({
  id: 'e',
  kind: 'expense',
  amountCents: 123456,
  date: '2026-03-10',
  accountId: 'a1',
  categoryId: 'c1',
  description: 'Mercado',
  tags: ['casa', 'mês'],
});
const income = tx({
  id: 'i',
  kind: 'income',
  amountCents: 500000,
  date: '2026-03-05',
  accountId: 'a2',
  categoryId: 'c2',
});
const transfer = tx({
  id: 't',
  kind: 'transfer',
  amountCents: 30000,
  date: '2026-03-07',
  accountId: 'a1',
  toAccountId: 'a2',
});
const april = tx({
  id: 'x',
  kind: 'expense',
  amountCents: 100,
  date: '2026-04-01',
  accountId: 'a1',
  categoryId: 'c1',
});
const all = [expense, income, transfer, april];

const filter = (overrides: Partial<ReportFilter> = {}): ReportFilter => ({
  from: '2026-03-01',
  to: '2026-03-31',
  accountIds: [],
  categoryIds: [],
  kinds: [],
  tags: [],
  ...overrides,
});

describe('filterTransactions', () => {
  it('keeps the period, inclusive, ordered by date', () => {
    expect(filterTransactions(all, filter()).map((item) => item.id)).toEqual(['i', 't', 'e']);
    expect(filterTransactions(all, filter({ to: '2026-04-01' })).map((item) => item.id)).toContain(
      'x',
    );
  });

  it('filters by account, counting a transfer on either side', () => {
    expect(filterTransactions(all, filter({ accountIds: ['a2'] })).map((item) => item.id)).toEqual([
      'i',
      't',
    ]);
    expect(filterTransactions(all, filter({ accountIds: ['a1'] })).map((item) => item.id)).toEqual([
      't',
      'e',
    ]);
  });

  it('filters by category, kind and tag', () => {
    expect(filterTransactions(all, filter({ categoryIds: ['c1'] })).map((item) => item.id)).toEqual(
      ['e'],
    );
    expect(filterTransactions(all, filter({ kinds: ['transfer'] })).map((item) => item.id)).toEqual(
      ['t'],
    );
    expect(filterTransactions(all, filter({ tags: ['casa'] })).map((item) => item.id)).toEqual([
      'e',
    ]);
    expect(filterTransactions(all, filter({ tags: ['viagem'] }))).toEqual([]);
  });

  it('combines filters', () => {
    expect(
      filterTransactions(all, filter({ accountIds: ['a1'], kinds: ['expense'] })).map(
        (item) => item.id,
      ),
    ).toEqual(['e']);
  });
});

describe('reportTotals', () => {
  it('totals income and expenses and ignores transfers', () => {
    expect(reportTotals([expense, income, transfer])).toEqual({
      incomeCents: 500000,
      expenseCents: 123456,
      netCents: 376544,
    });
  });
});

describe('report rows', () => {
  it('describes each movement, naming archived accounts', () => {
    expect(reportEntries([income, transfer, expense], accounts, categories)).toEqual([
      {
        date: '2026-03-05',
        kind: 'Receita',
        description: '',
        category: 'Salário',
        account: 'Conta antiga',
        toAccount: '',
        amountCents: 500000,
        tags: '',
      },
      {
        date: '2026-03-07',
        kind: 'Transferência',
        description: '',
        category: '',
        account: 'Nubank',
        toAccount: 'Conta antiga',
        amountCents: 30000,
        tags: '',
      },
      {
        date: '2026-03-10',
        kind: 'Despesa',
        description: 'Mercado',
        category: 'Alimentação',
        account: 'Nubank',
        toAccount: '',
        amountCents: 123456,
        tags: 'casa, mês',
      },
    ]);
  });

  it('renders text rows with a header, Brazilian dates and plain decimal values', () => {
    expect(reportRows(reportEntries([expense], accounts, categories))).toEqual([
      ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Conta destino', 'Valor', 'Tags'],
      ['10/03/2026', 'Despesa', 'Mercado', 'Alimentação', 'Nubank', '', '1234,56', 'casa, mês'],
    ]);
  });
});
