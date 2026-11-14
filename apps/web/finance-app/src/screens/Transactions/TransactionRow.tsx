import { Badge, Button } from '@industry/web';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import type { Transaction } from '../../domain/transaction';
import { accountName, categoryName, signedAmount } from '../../domain/transactionList';

interface TransactionRowProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  pending: boolean;
  forecast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionRow({
  transaction,
  accounts,
  categories,
  pending,
  forecast,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const isTransfer = transaction.kind === 'transfer';
  const category = isTransfer ? 'Transferência' : categoryName(categories, transaction.categoryId);
  const title = transaction.description || category;
  const account = accountName(accounts, transaction.accountId);
  const detail = isTransfer
    ? `${account} → ${accountName(accounts, transaction.toAccountId)}`
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
      {isTransfer || forecast ? null : (
        <Button size="sm" variant="ghost" aria-label={`Editar ${title}`} onClick={onEdit}>
          Editar
        </Button>
      )}
      {forecast ? null : (
        <Button size="sm" variant="ghost" aria-label={`Excluir ${title}`} onClick={onDelete}>
          Excluir
        </Button>
      )}
    </li>
  );
}
