import { Badge, Button } from '@industry/web';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import { formatCents } from '../../domain/money';
import type { Transaction } from '../../domain/transaction';
import { accountName, categoryName } from '../../domain/transactionList';

interface TransactionRowProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function signedAmount(transaction: Transaction): string {
  const amount = formatCents(transaction.amountCents);
  if (transaction.kind === 'income') return `+${amount}`;
  if (transaction.kind === 'expense') return `-${amount}`;
  return amount;
}

export function TransactionRow({
  transaction,
  accounts,
  categories,
  pending,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const isTransfer = transaction.kind === 'transfer';
  const category = isTransfer ? 'Transferência' : categoryName(categories, transaction.categoryId);
  const title = transaction.description || category;
  const account = accountName(accounts, transaction.accountId);
  const detail = isTransfer
    ? `${account} → ${accountName(accounts, transaction.toAccountId ?? '')}`
    : `${category} · ${account}`;

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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div>{title}</div>
        <div style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
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
      {isTransfer ? null : (
        <Button size="sm" variant="ghost" aria-label={`Editar ${title}`} onClick={onEdit}>
          Editar
        </Button>
      )}
      <Button size="sm" variant="ghost" aria-label={`Excluir ${title}`} onClick={onDelete}>
        Excluir
      </Button>
    </li>
  );
}
