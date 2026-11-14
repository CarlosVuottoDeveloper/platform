import { Button, Icon } from '@industry/web';
import { addMonths, formatMonthTitleBR } from '../../domain/calendarDate';
import type { YearMonth } from '../../domain/calendarDate';

interface MonthSwitcherProps {
  month: YearMonth;
  onChange: (month: YearMonth) => void;
}

export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: 'var(--space-1)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-pill)',
      }}
    >
      <Button
        size="sm"
        variant="ghost"
        iconOnly
        aria-label="Mês anterior"
        onClick={() => onChange(addMonths(month, -1))}
      >
        <Icon name="chevron-left" size="sm" />
      </Button>
      <span style={{ minWidth: 140, textAlign: 'center', fontWeight: 'var(--font-medium-weight)' }}>
        {formatMonthTitleBR(month)}
      </span>
      <Button
        size="sm"
        variant="ghost"
        iconOnly
        aria-label="Próximo mês"
        onClick={() => onChange(addMonths(month, 1))}
      >
        <Icon name="chevron-right" size="sm" />
      </Button>
    </div>
  );
}
