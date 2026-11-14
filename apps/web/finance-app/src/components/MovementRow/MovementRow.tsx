import { Badge, Button, Icon, IconBubble } from '@industry/web';
import type { Account } from '../../domain/account';
import { formatDateBR } from '../../domain/calendarDate';
import type { Category } from '../../domain/category';
import type { Transaction } from '../../domain/transaction';
import { accountName, categoryName, signedAmount } from '../../domain/transactionList';
import { movementIconName } from './movementIcon';

interface MovementActions {
  onEdit: () => void;
  onDelete: () => void;
}

interface MovementRowProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  pending: boolean;
  forecast: boolean;
  showDate: boolean;
  actions: MovementActions | null;
}

export function MovementRow({
  transaction,
  accounts,
  categories,
  pending,
  forecast,
  showDate,
  actions,
}: MovementRowProps) {
  const isTransfer = transaction.kind === 'transfer';
  const category = isTransfer ? 'Transferência' : categoryName(categories, transaction.categoryId);
  const title = transaction.description || category;
  const account = accountName(accounts, transaction.accountId);
  const where = isTransfer
    ? `${account} → ${accountName(accounts, transaction.toAccountId)}`
    : `${category} · ${account}`;
  const detail = showDate ? `${formatDateBR(transaction.date)} · ${where}` : where;
  const rowActions = forecast ? null : actions;

  return (
    <li
      data-testid={`transaction-${transaction.id}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) 0',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      <IconBubble size="sm">
        <Icon name={movementIconName(transaction, { pending })} size="sm" />
      </IconBubble>
      <div style={{ flex: 1, width: 0, minWidth: '45%' }}>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 'var(--text-h6)',
            color: 'var(--color-neutral-400)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {detail}
        </div>
      </div>
      {transaction.installment ? (
        <Badge tone="neutral">{`${transaction.installment.index} de ${transaction.installment.count}`}</Badge>
      ) : null}
      {pending ? <Badge tone="warning">Prevista</Badge> : null}
      <span
        style={{
          fontWeight: 'var(--font-medium-weight)',
          color: transaction.kind === 'income' ? 'var(--color-success-300)' : 'var(--color-text)',
        }}
      >
        {signedAmount(transaction)}
      </span>
      {rowActions && !isTransfer ? (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Editar ${title}`}
          onClick={rowActions.onEdit}
        >
          Editar
        </Button>
      ) : null}
      {rowActions ? (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Excluir ${title}`}
          onClick={rowActions.onDelete}
        >
          Excluir
        </Button>
      ) : null}
    </li>
  );
}
