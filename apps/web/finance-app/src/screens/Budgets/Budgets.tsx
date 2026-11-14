import { useState } from 'react';
import { Button, Card, EmptyState, Progress } from '@industry/web';
import { BudgetSheet } from '../../components/BudgetSheet/BudgetSheet';
import { BudgetStatusBadge } from '../../components/BudgetStatusBadge/BudgetStatusBadge';
import { MonthSwitcher } from '../../components/MonthSwitcher/MonthSwitcher';
import { useIsWideScreen } from '../../hooks/useIsWideScreen';
import { useToday } from '../../hooks/useToday';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { budgetProgress, expensesOfMonth } from '../../domain/budget';
import type { Budget } from '../../domain/budget';
import { lastDayOfMonth, yearMonthOf } from '../../domain/calendarDate';
import { categoriesOfKind } from '../../domain/category';
import type { Category } from '../../domain/category';
import { formatCents } from '../../domain/money';
import { projectedOccurrences } from '../../domain/recurrence';
import type { Transaction } from '../../domain/transaction';

interface BudgetRowProps {
  category: Category;
  budget: Budget | undefined;
  monthExpenses: Transaction[];
  onEdit: () => void;
}

function BudgetRow({ category, budget, monthExpenses, onEdit }: BudgetRowProps) {
  const progress = budget ? budgetProgress(budget, monthExpenses) : null;

  return (
    <li style={{ display: 'grid', minWidth: 0 }}>
      <Card data-testid={`budget-${category.id}`} elevation="sm" style={{ gap: 'var(--space-3)' }}>
        <div
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}
        >
          <span style={{ flex: 1, minWidth: 0, fontWeight: 'var(--font-medium-weight)' }}>
            {category.name}
          </span>
          {progress ? <BudgetStatusBadge status={progress.status} /> : null}
          <Button
            size="sm"
            variant="ghost"
            aria-label={`${budget ? 'Alterar' : 'Definir'} teto de ${category.name}`}
            onClick={onEdit}
          >
            {budget ? 'Alterar teto' : 'Definir teto'}
          </Button>
        </div>
        {budget && progress ? (
          <>
            <Progress value={progress.spentCents} max={budget.limitCents} showValue={false} />
            <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
              {`${formatCents(progress.spentCents)} de ${formatCents(budget.limitCents)}`}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
            Sem teto definido
          </span>
        )}
      </Card>
    </li>
  );
}

export function Budgets() {
  const { budgets, categories, recurrences, transactions } = useUserData();
  const today = useToday();
  const isWide = useIsWideScreen();
  const [month, setMonth] = useState(yearMonthOf(today));
  const [editing, setEditing] = useState<Category | null>(null);
  const expenseCategories = categoriesOfKind(categories, 'expense');
  const monthExpenses = expensesOfMonth(
    transactions,
    projectedOccurrences(recurrences, today, lastDayOfMonth(month)),
    month,
  );
  const budgetOf = (category: Category) =>
    budgets.find((budget) => budget.categoryId === category.id);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-3)',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ margin: 0 }}>Orçamentos</h1>
        <MonthSwitcher month={month} onChange={setMonth} />
      </div>
      {expenseCategories.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria de despesa"
          body="Crie categorias em Configurações para definir tetos de gastos."
        />
      ) : (
        <ul
          data-testid="budget-grid"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: 'var(--space-4)',
            gridTemplateColumns: isWide ? 'repeat(2, 1fr)' : '1fr',
          }}
        >
          {expenseCategories.map((category) => (
            <BudgetRow
              key={category.id}
              category={category}
              budget={budgetOf(category)}
              monthExpenses={monthExpenses}
              onEdit={() => setEditing(category)}
            />
          ))}
        </ul>
      )}
      {editing ? (
        <BudgetSheet
          category={editing}
          budget={budgetOf(editing)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
