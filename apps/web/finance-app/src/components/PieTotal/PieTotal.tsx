import { formatCents } from '../../domain/money';
import type { Cents } from '../../domain/money';

export function PieTotal({ cents }: { cents: Cents }) {
  return (
    <div style={{ display: 'grid', justifyItems: 'center' }}>
      <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>Total</span>
      <span style={{ fontWeight: 'var(--font-heading-weight)' }}>{formatCents(cents)}</span>
    </div>
  );
}
