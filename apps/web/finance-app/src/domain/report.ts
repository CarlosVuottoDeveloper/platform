import type { Account } from './account';
import { formatDateBR } from './calendarDate';
import type { CalendarDate } from './calendarDate';
import type { Category } from './category';
import type { Cents } from './money';
import type { Transaction, TransactionKind } from './transaction';
import { accountName, categoryName } from './transactionList';

export interface ReportFilter {
  from: CalendarDate;
  to: CalendarDate;
  accountIds: string[];
  categoryIds: string[];
  kinds: TransactionKind[];
  tags: string[];
}

export interface ReportEntry {
  date: CalendarDate;
  kind: string;
  description: string;
  category: string;
  account: string;
  toAccount: string;
  amountCents: Cents;
  tags: string;
}

export const REPORT_HEADER = [
  'Data',
  'Tipo',
  'Descrição',
  'Categoria',
  'Conta',
  'Conta destino',
  'Valor',
  'Tags',
];

const KIND_LABELS: Record<TransactionKind, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
};

const matchesAny = <T>(selected: T[], candidates: (T | null)[]) =>
  selected.length === 0 ||
  candidates.some((candidate) => candidate !== null && selected.includes(candidate));

export function filterTransactions(
  transactions: Transaction[],
  filter: ReportFilter,
): Transaction[] {
  return transactions
    .filter(
      (transaction) =>
        transaction.date >= filter.from &&
        transaction.date <= filter.to &&
        matchesAny(filter.accountIds, [transaction.accountId, transaction.toAccountId]) &&
        matchesAny(filter.categoryIds, [transaction.categoryId]) &&
        matchesAny(filter.kinds, [transaction.kind]) &&
        matchesAny(filter.tags, transaction.tags),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function reportTotals(transactions: Transaction[]): {
  incomeCents: Cents;
  expenseCents: Cents;
  netCents: Cents;
} {
  const totalOf = (kind: TransactionKind) =>
    transactions
      .filter((transaction) => transaction.kind === kind)
      .reduce((total, transaction) => total + transaction.amountCents, 0);
  const incomeCents = totalOf('income');
  const expenseCents = totalOf('expense');
  return { incomeCents, expenseCents, netCents: incomeCents - expenseCents };
}

export function reportEntries(
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[],
): ReportEntry[] {
  return transactions.map((transaction) => {
    const isTransfer = transaction.kind === 'transfer';
    return {
      date: transaction.date,
      kind: KIND_LABELS[transaction.kind],
      description: transaction.description,
      category: isTransfer ? '' : categoryName(categories, transaction.categoryId),
      account: accountName(accounts, transaction.accountId),
      toAccount: isTransfer ? accountName(accounts, transaction.toAccountId) : '',
      amountCents: transaction.amountCents,
      tags: transaction.tags.join(', '),
    };
  });
}

function decimalText(cents: Cents): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function reportRows(entries: ReportEntry[]): string[][] {
  return [
    REPORT_HEADER,
    ...entries.map((entry) => [
      formatDateBR(entry.date),
      entry.kind,
      entry.description,
      entry.category,
      entry.account,
      entry.toAccount,
      decimalText(entry.amountCents),
      entry.tags,
    ]),
  ];
}
