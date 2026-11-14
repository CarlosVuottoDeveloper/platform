import { Badge } from '@industry/web';
import type { BudgetStatus } from '../../domain/budget';

export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
  if (status === 'exceeded') return <Badge tone="danger">Limite estourado</Badge>;
  if (status === 'warning') return <Badge tone="warning">Perto do limite</Badge>;
  return null;
}
