import type { CSSProperties } from 'react';
import { Badge, Button, Icon, IconBubble } from '@industry/web';
import type { Account } from '../../domain/account';
import { formatDateBR } from '../../domain/calendarDate';
import type { Category } from '../../domain/category';
import type { Transaction } from '../../domain/transaction';
import { accountName, categoryName, signedAmount } from '../../domain/transactionList';
import { useIsWideScreen } from '../../hooks/useIsWideScreen';
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
  divided: boolean;
}

const ELLIPSIS: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const LINE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
};

export function MovementRow({
  transaction,
  accounts,
  categories,
  pending,
  forecast,
  showDate,
  actions,
  divided,
}: MovementRowProps) {
  const isWide = useIsWideScreen();
  const isTransfer = transaction.kind === 'transfer';
  const category = isTransfer ? 'Transferência' : categoryName(categories, transaction.categoryId);
  const title = transaction.description || category;
  const account = accountName(accounts, transaction.accountId);
  const where = isTransfer
    ? `${account} → ${accountName(accounts, transaction.toAccountId)}`
    : `${category} · ${account}`;
  const detail = showDate ? `${formatDateBR(transaction.date)} · ${where}` : where;
  const rowActions = forecast ? null : actions;

  const bubble = (
    <IconBubble size="sm">
      <Icon name={movementIconName(transaction, { pending })} size="sm" />
    </IconBubble>
  );
  const text = (
    <div style={{ flex: 1, width: 0, minWidth: isWide ? '45%' : 0 }}>
      <div style={ELLIPSIS}>{title}</div>
      <div style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)', ...ELLIPSIS }}>
        {detail}
      </div>
    </div>
  );
  const badges = [
    transaction.installment ? (
      <Badge key="installment" tone="neutral">
        {`${transaction.installment.index} de ${transaction.installment.count}`}
      </Badge>
    ) : null,
    pending ? (
      <Badge key="pending" tone="warning">
        Prevista
      </Badge>
    ) : null,
  ].filter(Boolean);
  const amount = (
    <span
      style={{
        fontWeight: 'var(--font-medium-weight)',
        whiteSpace: 'nowrap',
        color: transaction.kind === 'income' ? 'var(--color-success-300)' : 'var(--color-text)',
      }}
    >
      {signedAmount(transaction)}
    </span>
  );
  const buttons = rowActions
    ? [
        isTransfer ? null : (
          <Button
            key="edit"
            size="sm"
            variant="ghost"
            aria-label={`Editar ${title}`}
            onClick={rowActions.onEdit}
          >
            Editar
          </Button>
        ),
        <Button
          key="delete"
          size="sm"
          variant="ghost"
          aria-label={`Excluir ${title}`}
          onClick={rowActions.onDelete}
        >
          Excluir
        </Button>,
      ]
    : [];
  const rowStyle: CSSProperties = {
    padding: 'var(--space-3) 0',
    borderTop: divided ? '1px solid var(--color-divider)' : undefined,
  };

  if (isWide) {
    return (
      <li data-testid={`transaction-${transaction.id}`} style={{ ...LINE, ...rowStyle }}>
        {bubble}
        {text}
        {badges}
        {amount}
        {buttons}
      </li>
    );
  }

  const hasSecondLine = badges.length > 0 || buttons.length > 0;

  return (
    <li
      data-testid={`transaction-${transaction.id}`}
      style={{ display: 'grid', gap: 'var(--space-2)', ...rowStyle }}
    >
      <div style={LINE}>
        {bubble}
        {text}
        {amount}
      </div>
      {hasSecondLine ? (
        <div
          style={{
            ...LINE,
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            paddingLeft: 'calc(32px + var(--space-3))',
          }}
        >
          {badges}
          {buttons}
        </div>
      ) : null}
    </li>
  );
}
