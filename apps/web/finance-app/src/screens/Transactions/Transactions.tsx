import { useState } from 'react';
import { EmptyState, SearchField } from '@industry/web';
import { ConfirmSheet } from '../../components/ConfirmSheet/ConfirmSheet';
import { MonthSwitcher } from '../../components/MonthSwitcher/MonthSwitcher';
import { TransactionSheet } from '../../components/TransactionSheet/TransactionSheet';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { formatDateBR, toCalendarDate, yearMonthOf } from '../../domain/calendarDate';
import { installmentsFrom } from '../../domain/installment';
import type { Transaction } from '../../domain/transaction';
import {
  groupByDate,
  isPending,
  matchesSearch,
  transactionsOfMonth,
} from '../../domain/transactionList';
import { deleteTransactions } from '../../services/transactionsService';
import { TransactionRow } from './TransactionRow';

type SheetState =
  | { mode: 'closed' }
  | { mode: 'edit'; transaction: Transaction }
  | { mode: 'delete'; transaction: Transaction };

export function Transactions() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { accounts, categories, transactions } = useUserData();
  const today = toCalendarDate(new Date());
  const [month, setMonth] = useState(yearMonthOf(today));
  const [search, setSearch] = useState('');
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' });
  const closeSheet = () => setSheet({ mode: 'closed' });

  const visible = transactionsOfMonth(transactions, month).filter((transaction) =>
    matchesSearch(transaction, search),
  );

  function followingInstallments(transaction: Transaction): Transaction[] {
    if (!transaction.installment) return [];
    const { groupId, index } = transaction.installment;
    return installmentsFrom(transactions, groupId, index + 1);
  }

  async function confirmDelete(toDelete: Transaction[]) {
    if (!user) return;
    closeSheet();
    try {
      await deleteTransactions(
        user.uid,
        toDelete.map((transaction) => transaction.id),
      );
    } catch {
      showToast('danger', 'Não foi possível excluir.');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <h1 style={{ margin: 0 }}>Transações</h1>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-3)',
          justifyContent: 'space-between',
        }}
      >
        <MonthSwitcher month={month} onChange={setMonth} />
        <SearchField
          placeholder="Buscar por descrição ou tag"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ flex: 1, minWidth: 200, maxWidth: 360 }}
        />
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="Nenhuma movimentação neste mês"
          body="Use o botão Nova movimentação para registrar uma receita ou despesa."
        />
      ) : null}
      {groupByDate(visible).map((group) => (
        <section key={group.date} aria-label={formatDateBR(group.date)}>
          <h2 style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
            {formatDateBR(group.date)}
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {group.items.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                accounts={accounts}
                categories={categories}
                pending={isPending(transaction, today)}
                onEdit={() => setSheet({ mode: 'edit', transaction })}
                onDelete={() => setSheet({ mode: 'delete', transaction })}
              />
            ))}
          </ul>
        </section>
      ))}
      {sheet.mode === 'edit' ? (
        <TransactionSheet transaction={sheet.transaction} onClose={closeSheet} />
      ) : null}
      {sheet.mode === 'delete' && followingInstallments(sheet.transaction).length === 0 ? (
        <ConfirmSheet
          title="Excluir movimentação"
          message="A movimentação será excluída e os saldos serão recalculados."
          confirmLabel="Excluir"
          onConfirm={() => confirmDelete([sheet.transaction])}
          onDismiss={closeSheet}
        />
      ) : null}
      {sheet.mode === 'delete' && followingInstallments(sheet.transaction).length > 0 ? (
        <ConfirmSheet
          title="Excluir parcela"
          message="Esta compra tem parcelas seguintes. O que você quer excluir?"
          confirmLabel="Só esta"
          onConfirm={() => confirmDelete([sheet.transaction])}
          alternative={{
            label: 'Esta e as seguintes',
            onChoose: () =>
              confirmDelete([sheet.transaction, ...followingInstallments(sheet.transaction)]),
          }}
          onDismiss={closeSheet}
        />
      ) : null}
    </div>
  );
}
