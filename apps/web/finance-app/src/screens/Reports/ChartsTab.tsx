import { useState } from 'react';
import { AreaChart, BarChart, Card, EmptyState, PieChart } from '@industry/web';
import { MonthSwitcher } from '../../components/MonthSwitcher/MonthSwitcher';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import {
  addMonths,
  formatMonthShortBR,
  lastDayOfMonth,
  monthsBetween,
  toCalendarDate,
  yearMonthOf,
} from '../../domain/calendarDate';
import { dailyConsolidatedBalance, expensesByCategory, monthlyCashFlow } from '../../domain/charts';
import { formatCents } from '../../domain/money';

const CASH_FLOW_MONTHS = 6;
const CASH_FLOW_SERIES = [
  { label: 'Receitas', color: 'var(--viz-3)' },
  { label: 'Despesas', color: 'var(--viz-5)' },
];

export function ChartsTab() {
  const { accounts, categories, transactions } = useUserData();
  const today = toCalendarDate(new Date());
  const currentMonth = yearMonthOf(today);
  const [month, setMonth] = useState(currentMonth);

  const spending = expensesByCategory(
    transactions,
    categories,
    `${month}-01`,
    lastDayOfMonth(month),
  );
  const cashFlow = monthlyCashFlow(
    transactions,
    monthsBetween(addMonths(currentMonth, 1 - CASH_FLOW_MONTHS), currentMonth),
    today,
  );
  const hasCashFlow = cashFlow.some((entry) => entry.incomeCents > 0 || entry.expenseCents > 0);
  const dailyBalance =
    accounts.length > 0 ? dailyConsolidatedBalance(accounts, transactions, month, today) : [];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <MonthSwitcher month={month} onChange={setMonth} />
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        <Card elevation="sm" title="Despesas por categoria">
          {spending.length === 0 ? (
            <EmptyState title="Sem despesas neste mês" />
          ) : (
            <PieChart
              slices={spending.map((entry) => ({
                label: entry.label,
                value: entry.totalCents,
                color: entry.color,
              }))}
              valueFormatter={formatCents}
            />
          )}
        </Card>
        <Card elevation="sm" title="Receitas × despesas">
          {hasCashFlow ? (
            <BarChart
              series={CASH_FLOW_SERIES}
              groups={cashFlow.map((entry) => ({
                label: formatMonthShortBR(entry.month),
                values: [entry.incomeCents, entry.expenseCents],
              }))}
              valueFormatter={formatCents}
            />
          ) : (
            <EmptyState title="Sem movimentações nos últimos meses" />
          )}
        </Card>
      </div>
      <Card elevation="sm" title="Saldo consolidado no mês">
        {accounts.length === 0 ? (
          <EmptyState title="Cadastre uma conta para ver a evolução do saldo" />
        ) : dailyBalance.length === 0 ? (
          <EmptyState title="Este mês ainda não começou" />
        ) : (
          <AreaChart
            points={dailyBalance.map((point) => ({
              label: point.date.slice(8),
              value: point.balanceCents,
            }))}
            valueFormatter={formatCents}
          />
        )}
      </Card>
    </div>
  );
}
