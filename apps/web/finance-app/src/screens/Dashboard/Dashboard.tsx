import { useState } from 'react';
import { Link } from 'react-router';
import { Card, EmptyState, Icon, StatTile } from '@industry/web';
import type { IconName } from '@industry/web';
import { BudgetStatusBadge } from '../../components/BudgetStatusBadge/BudgetStatusBadge';
import { MonthSwitcher } from '../../components/MonthSwitcher/MonthSwitcher';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { budgetProgress, expensesOfMonth } from '../../domain/budget';
import {
  formatDateBR,
  lastDayOfMonth,
  toCalendarDate,
  yearMonthOf,
} from '../../domain/calendarDate';
import { formatCents } from '../../domain/money';
import { summarizeMonth } from '../../domain/monthSummary';
import { projectedOccurrences } from '../../domain/recurrence';
import type { Transaction } from '../../domain/transaction';
import { categoryName, signedAmount } from '../../domain/transactionList';

const LATEST_COUNT = 5;

interface SummaryTileProps {
  testID: string;
  icon: IconName;
  label: string;
  cents: number;
}

function SummaryTile({ testID, icon, label, cents }: SummaryTileProps) {
  return (
    <Card elevation="sm">
      <StatTile
        testID={testID}
        icon={<Icon name={icon} />}
        label={label}
        value={formatCents(cents)}
      />
    </Card>
  );
}

function latestRealised(transactions: Transaction[], today: string): Transaction[] {
  return transactions
    .filter((transaction) => transaction.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, LATEST_COUNT);
}

export function Dashboard() {
  const { accounts, budgets, categories, recurrences, transactions } = useUserData();
  const today = toCalendarDate(new Date());
  const [month, setMonth] = useState(yearMonthOf(today));

  if (accounts.length === 0) {
    return (
      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        <h1 style={{ margin: 0 }}>Painel</h1>
        <EmptyState
          title="Comece cadastrando uma conta"
          body="Com uma conta cadastrada você já pode registrar receitas e despesas."
          action={
            <Link to="/contas" style={{ color: 'var(--color-accent-300)' }}>
              Cadastrar conta
            </Link>
          }
        />
      </div>
    );
  }

  const summary = summarizeMonth({ accounts, transactions, recurrences, month, today });
  const latest = latestRealised(transactions, today);
  const monthExpenses = expensesOfMonth(
    transactions,
    projectedOccurrences(recurrences, today, lastDayOfMonth(month)),
    month,
  );
  const budgetAlerts = budgets
    .map((budget) => ({
      budget,
      category: categories.find((category) => category.id === budget.categoryId),
      status: budgetProgress(budget, monthExpenses).status,
    }))
    .filter((alert) => alert.status !== 'ok' && alert.category && !alert.category.archived);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-3)',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ margin: 0 }}>Painel</h1>
        <MonthSwitcher month={month} onChange={setMonth} />
      </div>
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <SummaryTile
          testID="summary-balance"
          icon="wallet"
          label="Saldo geral"
          cents={summary.balanceCents}
        />
        <SummaryTile
          testID="summary-income"
          icon="trending-up"
          label="Receitas"
          cents={summary.incomeCents}
        />
        <SummaryTile
          testID="summary-expense"
          icon="trending-down"
          label="Despesas"
          cents={summary.expenseCents}
        />
        <SummaryTile
          testID="summary-expected"
          icon="calendar-check"
          label="Balanço esperado no fim do mês"
          cents={summary.expectedEndBalanceCents}
        />
      </div>
      {budgetAlerts.length > 0 ? (
        <section aria-label="Orçamentos em alerta">
          <h2 style={{ fontSize: 'var(--text-h4)' }}>Orçamentos em alerta</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {budgetAlerts.map(({ budget, category, status }) => (
              <li
                key={budget.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) 0',
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>{category?.name}</span>
                <BudgetStatusBadge status={status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section aria-label="Últimas movimentações">
        <h2 style={{ fontSize: 'var(--text-h4)' }}>Últimas movimentações</h2>
        {latest.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-neutral-400)' }}>
            Nenhuma movimentação ainda.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {latest.map((transaction) => (
              <li
                key={transaction.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) 0',
                  borderBottom: '1px solid var(--color-divider)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div>
                    {transaction.description ||
                      (transaction.kind === 'transfer'
                        ? 'Transferência'
                        : categoryName(categories, transaction.categoryId))}
                  </div>
                  <div style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
                    {formatDateBR(transaction.date)}
                  </div>
                </div>
                <span style={{ fontWeight: 'var(--font-medium-weight)' }}>
                  {signedAmount(transaction)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
