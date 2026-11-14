import { useState } from 'react';
import { Link } from 'react-router';
import { Card, EmptyState, GradientSurface, Icon, PieChart, StatTile } from '@industry/web';
import type { IconName } from '@industry/web';
import { CardHeading } from '../../components/CardHeading/CardHeading';
import { BudgetStatusBadge } from '../../components/BudgetStatusBadge/BudgetStatusBadge';
import { MonthSwitcher } from '../../components/MonthSwitcher/MonthSwitcher';
import { MovementRow } from '../../components/MovementRow/MovementRow';
import { useIsWideScreen } from '../../hooks/useIsWideScreen';
import { useToday } from '../../hooks/useToday';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { budgetProgress, expensesOfMonth } from '../../domain/budget';
import { lastDayOfMonth, yearMonthOf } from '../../domain/calendarDate';
import { expensesByCategory } from '../../domain/charts';
import { formatCents } from '../../domain/money';
import { summarizeMonth } from '../../domain/monthSummary';
import { projectedOccurrences } from '../../domain/recurrence';
import type { Transaction } from '../../domain/transaction';

const LATEST_COUNT = 5;

interface SummaryTileProps {
  testID: string;
  icon: IconName;
  iconColor?: string;
  label: string;
  cents: number;
  highlighted?: boolean;
}

function SummaryTile({
  testID,
  icon,
  iconColor,
  label,
  cents,
  highlighted = false,
}: SummaryTileProps) {
  return (
    <GradientSurface
      data-testid={`${testID}-card`}
      variant={highlighted ? 'primary' : 'surface'}
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-divider)',
        boxShadow: 'var(--shadow-sm)',
        minWidth: 0,
      }}
    >
      <StatTile
        testID={testID}
        tone={highlighted ? 'onPrimary' : 'default'}
        icon={<Icon name={icon} style={iconColor ? { color: iconColor } : undefined} />}
        label={label}
        value={formatCents(cents)}
      />
    </GradientSurface>
  );
}

function CardLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      style={{
        color: 'var(--color-accent-300)',
        fontSize: 'var(--text-h6)',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Link>
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
  const today = useToday();
  const isWide = useIsWideScreen();
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
  const monthEnd = lastDayOfMonth(month);
  const monthExpenses = expensesOfMonth(
    transactions,
    projectedOccurrences(recurrences, today, monthEnd),
    month,
  );
  const budgetAlerts = budgets
    .map((budget) => ({
      budget,
      category: categories.find((category) => category.id === budget.categoryId),
      status: budgetProgress(budget, monthExpenses).status,
    }))
    .filter((alert) => alert.status !== 'ok' && alert.category && !alert.category.archived);
  const spending = expensesByCategory(
    transactions,
    categories,
    `${month}-01`,
    monthEnd < today ? monthEnd : today,
  );
  const spendingTotal = spending.reduce((sum, entry) => sum + entry.totalCents, 0);

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
        data-testid="summary-tiles"
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: isWide ? 'repeat(4, 1fr)' : '1fr',
        }}
      >
        <SummaryTile
          testID="summary-balance"
          icon="wallet"
          label="Saldo geral"
          cents={summary.balanceCents}
          highlighted
        />
        <SummaryTile
          testID="summary-income"
          icon="trending-up"
          iconColor="var(--color-success-300)"
          label="Receitas"
          cents={summary.incomeCents}
        />
        <SummaryTile
          testID="summary-expense"
          icon="trending-down"
          iconColor="var(--color-danger-300)"
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
      <div
        data-testid="dashboard-columns"
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: isWide ? '2fr 1fr' : '1fr',
          alignItems: 'start',
        }}
      >
        <Card
          role="region"
          aria-label="Últimas movimentações"
          elevation="sm"
          title={<CardHeading>Últimas movimentações</CardHeading>}
          action={<CardLink to="/transacoes">Ver todas</CardLink>}
        >
          {latest.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-neutral-400)' }}>
              Nenhuma movimentação ainda.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {latest.map((transaction) => (
                <MovementRow
                  key={transaction.id}
                  transaction={transaction}
                  accounts={accounts}
                  categories={categories}
                  pending={false}
                  forecast={false}
                  showDate
                  actions={null}
                />
              ))}
            </ul>
          )}
        </Card>
        <div style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
          {budgetAlerts.length > 0 ? (
            <Card
              role="region"
              aria-label="Orçamentos em alerta"
              elevation="sm"
              title={<CardHeading>Orçamentos em alerta</CardHeading>}
              action={<CardLink to="/orcamentos">Ver orçamentos</CardLink>}
            >
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {budgetAlerts.map(({ budget, category, status }) => (
                  <li
                    key={budget.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-2) 0',
                      borderBottom: '1px solid var(--color-divider)',
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0 }}>{category?.name}</span>
                    <BudgetStatusBadge status={status} />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          <Card
            role="region"
            aria-label="Despesas por categoria"
            elevation="sm"
            title={<CardHeading>Despesas por categoria</CardHeading>}
          >
            {spending.length === 0 ? (
              <EmptyState title="Sem despesas neste mês" />
            ) : (
              <PieChart
                size={180}
                legendValue="percent"
                valueFormatter={formatCents}
                centerLabel={
                  <div style={{ display: 'grid', justifyItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
                      Total
                    </span>
                    <span style={{ fontWeight: 'var(--font-heading-weight)' }}>
                      {formatCents(spendingTotal)}
                    </span>
                  </div>
                }
                slices={spending.map((entry) => ({
                  label: entry.label,
                  value: entry.totalCents,
                  color: entry.color,
                }))}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
