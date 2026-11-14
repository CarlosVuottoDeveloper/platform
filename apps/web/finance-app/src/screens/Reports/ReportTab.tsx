import { useState } from 'react';
import { Button, DataTable, EmptyState, Select, TextField } from '@industry/web';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { formatDateBR, toCalendarDate, yearMonthOf } from '../../domain/calendarDate';
import { formatCents } from '../../domain/money';
import { filterTransactions, reportEntries, reportRows, reportTotals } from '../../domain/report';
import type { ReportFilter } from '../../domain/report';
import { knownTags } from '../../domain/tag';
import type { TransactionKind } from '../../domain/transaction';
import { downloadCsv, downloadPdf, downloadXlsx } from '../../services/exportService';

const ALL = '';
const KIND_OPTIONS = [
  { value: ALL, label: 'Todos' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
  { value: 'transfer', label: 'Transferências' },
];
const COLUMNS = [
  { key: 'date', label: 'Data', sortable: false },
  { key: 'kind', label: 'Tipo', sortable: false },
  { key: 'description', label: 'Descrição', sortable: false },
  { key: 'category', label: 'Categoria', sortable: false },
  { key: 'account', label: 'Conta', sortable: false },
  { key: 'toAccount', label: 'Conta destino', sortable: false },
  { key: 'amount', label: 'Valor', sortable: false },
  { key: 'tags', label: 'Tags', sortable: false },
];

const selected = <T extends string>(value: string): T[] => (value === ALL ? [] : [value as T]);
const withAll = (label: string, options: { value: string; label: string }[]) => [
  { value: ALL, label },
  ...options,
];
const byLabel = (a: { label: string }, b: { label: string }) =>
  a.label.localeCompare(b.label, 'pt-BR');

export function ReportTab() {
  const { showToast } = useToast();
  const { accounts, categories, transactions } = useUserData();
  const today = toCalendarDate(new Date());
  const [from, setFrom] = useState(`${yearMonthOf(today)}-01`);
  const [to, setTo] = useState(today);
  const [accountId, setAccountId] = useState(ALL);
  const [categoryId, setCategoryId] = useState(ALL);
  const [kind, setKind] = useState(ALL);
  const [tag, setTag] = useState(ALL);

  const filter: ReportFilter = {
    from,
    to,
    accountIds: selected(accountId),
    categoryIds: selected(categoryId),
    kinds: selected<TransactionKind>(kind),
    tags: selected(tag),
  };
  const matching = filterTransactions(transactions, filter);
  const entries = reportEntries(matching, accounts, categories);
  const totals = reportTotals(matching);
  const totalLines = [
    `Receitas: ${formatCents(totals.incomeCents)}`,
    `Despesas: ${formatCents(totals.expenseCents)}`,
    `Saldo: ${formatCents(totals.netCents)}`,
  ];
  const filename = (extension: string) => `relatorio-${from}-a-${to}.${extension}`;
  const isEmpty = entries.length === 0;

  async function exportWith(action: () => void | Promise<void>) {
    try {
      await action();
    } catch {
      showToast('danger', 'Não foi possível exportar.');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-3)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        <TextField
          label="De"
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        />
        <TextField
          label="Até"
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
        <Select
          label="Conta"
          value={accountId}
          onChange={(event) => setAccountId(event.target.value)}
          options={withAll(
            'Todas',
            accounts.map((account) => ({ value: account.id, label: account.name })).sort(byLabel),
          )}
        />
        <Select
          label="Categoria"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          options={withAll(
            'Todas',
            categories
              .map((category) => ({ value: category.id, label: category.name }))
              .sort(byLabel),
          )}
        />
        <Select
          label="Tipo"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          options={KIND_OPTIONS}
        />
        <Select
          label="Tag"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          options={withAll(
            'Todas',
            knownTags(transactions).map((known) => ({ value: known, label: known })),
          )}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-3)',
          justifyContent: 'space-between',
        }}
      >
        <div
          data-testid="report-totals"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}
        >
          {totalLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button
            size="sm"
            variant="secondary"
            disabled={isEmpty}
            onClick={() => exportWith(() => downloadCsv(reportRows(entries), filename('csv')))}
          >
            CSV
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={isEmpty}
            onClick={() => exportWith(() => downloadXlsx(entries, filename('xlsx')))}
          >
            Excel
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={isEmpty}
            onClick={() =>
              exportWith(() =>
                downloadPdf(
                  `Relatório de ${formatDateBR(from)} a ${formatDateBR(to)}`,
                  reportRows(entries),
                  totalLines,
                  filename('pdf'),
                ),
              )
            }
          >
            PDF
          </Button>
        </div>
      </div>
      {isEmpty ? (
        <EmptyState title="Nenhuma movimentação com esses filtros" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <DataTable
            columns={COLUMNS}
            rows={entries.map((entry) => ({
              date: formatDateBR(entry.date),
              kind: entry.kind,
              description: entry.description,
              category: entry.category,
              account: entry.account,
              toAccount: entry.toAccount,
              amount: formatCents(entry.amountCents),
              tags: entry.tags,
            }))}
          />
        </div>
      )}
    </div>
  );
}
