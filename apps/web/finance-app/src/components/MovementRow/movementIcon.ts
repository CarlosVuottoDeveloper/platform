import type { IconName } from '@industry/web';
import type { Transaction } from '../../domain/transaction';

export function movementIconName(
  transaction: Transaction,
  { pending }: { pending: boolean },
): IconName {
  if (pending) return 'calendar-check';
  if (transaction.kind === 'transfer') return 'arrow-left-right';
  if (transaction.installment) return 'credit-card';
  return transaction.kind === 'income' ? 'trending-up' : 'trending-down';
}
