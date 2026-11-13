import { Button, Icon } from '@industry/web';
import { addMonths, formatMonthBR } from '../../domain/calendarDate';
import type { YearMonth } from '../../domain/calendarDate';

interface MonthSwitcherProps {
  month: YearMonth;
  onChange: (month: YearMonth) => void;
}

export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <Button
        size="sm"
        variant="ghost"
        iconOnly
        aria-label="Mês anterior"
        onClick={() => onChange(addMonths(month, -1))}
      >
        <Icon name="chevron-left" size="sm" />
      </Button>
      <span style={{ minWidth: 140, textAlign: 'center', textTransform: 'capitalize' }}>
        {formatMonthBR(month)}
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
