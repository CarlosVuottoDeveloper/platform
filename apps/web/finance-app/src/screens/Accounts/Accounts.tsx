import { useState } from 'react';
import {
  Button,
  Card,
  EmptyState,
  GradientSurface,
  Icon,
  IconBubble,
  StatTile,
} from '@industry/web';
import type { IconName } from '@industry/web';
import { AccountSheet } from '../../components/AccountSheet/AccountSheet';
import { ConfirmSheet } from '../../components/ConfirmSheet/ConfirmSheet';
import { TransferSheet } from '../../components/TransferSheet/TransferSheet';
import { useSignedInUser } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useIsWideScreen } from '../../hooks/useIsWideScreen';
import { useToday } from '../../hooks/useToday';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { ACCOUNT_TYPE_LABELS, groupAccounts, isLiability } from '../../domain/account';
import type { Account } from '../../domain/account';
import { colorVariable } from '../../domain/appearance';
import {
  accountBalanceOn,
  consolidatedBalanceOn,
  isAccountInUse,
  pendingTotalAfter,
} from '../../domain/balance';
import { formatCents } from '../../domain/money';
import type { Transaction } from '../../domain/transaction';
import { deleteAccount, setAccountArchived } from '../../services/accountsService';

type SheetState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'transfer' }
  | { mode: 'edit'; account: Account }
  | { mode: 'delete'; account: Account };

interface AccountActions {
  onEdit: (account: Account) => void;
  onToggleArchived: (account: Account) => void;
  onDelete: (account: Account) => void;
}

interface AccountRowProps extends AccountActions {
  account: Account;
  transactions: Transaction[];
  inUse: boolean;
  today: string;
}

function AccountRow({
  account,
  transactions,
  inUse,
  today,
  onEdit,
  onToggleArchived,
  onDelete,
}: AccountRowProps) {
  const archiveLabel = account.archived ? 'Desarquivar' : 'Arquivar';
  const pending = isLiability(account.type) ? pendingTotalAfter(account, transactions, today) : 0;

  return (
    <li
      data-testid={`account-${account.id}`}
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
        <Icon name={account.icon as IconName} color={colorVariable(account.color)} />
      </IconBubble>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div>{account.name}</div>
        <div style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
          {ACCOUNT_TYPE_LABELS[account.type]}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 'var(--font-medium-weight)' }}>
          {formatCents(accountBalanceOn(account, transactions, today))}
        </div>
        {pending !== 0 ? (
          <div style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
            {`A vencer: ${formatCents(pending)}`}
          </div>
        ) : null}
      </div>
      <Button
        size="sm"
        variant="ghost"
        aria-label={`Editar ${account.name}`}
        onClick={() => onEdit(account)}
      >
        Editar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-label={`${archiveLabel} ${account.name}`}
        onClick={() => onToggleArchived(account)}
      >
        {archiveLabel}
      </Button>
      {inUse ? null : (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Excluir ${account.name}`}
          onClick={() => onDelete(account)}
        >
          Excluir
        </Button>
      )}
    </li>
  );
}

interface AccountSectionProps extends AccountActions {
  title: string;
  accounts: Account[];
  transactions: Transaction[];
  isInUse: (account: Account) => boolean;
  today: string;
}

function AccountSection({ title, accounts, isInUse, ...rowProps }: AccountSectionProps) {
  if (accounts.length === 0) return null;

  return (
    <Card role="region" aria-label={title} title={title} elevation="sm">
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {accounts.map((account) => (
          <AccountRow key={account.id} account={account} inUse={isInUse(account)} {...rowProps} />
        ))}
      </ul>
    </Card>
  );
}

export function Accounts() {
  const user = useSignedInUser();
  const { showToast } = useToast();
  const { accounts, recurrences, transactions } = useUserData();
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' });
  const today = useToday();
  const isWide = useIsWideScreen();
  const groups = groupAccounts(accounts);
  const activeAccounts = [...groups.assets, ...groups.liabilities];
  const closeSheet = () => setSheet({ mode: 'closed' });

  async function runOrWarn(action: () => Promise<void>) {
    try {
      await action();
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  function toggleArchived(account: Account) {
    void runOrWarn(() => setAccountArchived(user.uid, account.id, !account.archived));
  }

  function confirmDelete(account: Account) {
    closeSheet();
    void runOrWarn(() => deleteAccount(user.uid, account.id));
  }

  const sectionProps = {
    transactions,
    isInUse: (account: Account) => isAccountInUse(account.id, transactions, recurrences),
    today,
    onEdit: (account: Account) => setSheet({ mode: 'edit', account }),
    onToggleArchived: toggleArchived,
    onDelete: (account: Account) => setSheet({ mode: 'delete', account }),
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-3)',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ margin: 0 }}>Contas</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button
            variant="secondary"
            disabled={activeAccounts.length < 2}
            onClick={() => setSheet({ mode: 'transfer' })}
          >
            Transferir
          </Button>
          <Button variant="primary" onClick={() => setSheet({ mode: 'create' })}>
            Nova conta
          </Button>
        </div>
      </div>
      {accounts.length === 0 ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          body="Cadastre seu banco, carteira ou cartão para começar a registrar movimentações."
        />
      ) : (
        <GradientSurface
          data-testid="consolidated-balance-card"
          variant="primary"
          style={{
            justifySelf: isWide ? 'start' : 'stretch',
            minWidth: isWide ? 320 : 0,
            padding: 'var(--space-4)',
            border: '1px solid var(--color-divider)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <StatTile
            testID="consolidated-balance"
            tone="onPrimary"
            icon={<Icon name="wallet" />}
            label="Saldo consolidado"
            value={formatCents(consolidatedBalanceOn(accounts, transactions, today))}
          />
        </GradientSurface>
      )}
      <div
        data-testid="account-columns"
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: isWide ? '1fr 1fr' : '1fr',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', minWidth: 0 }}>
          <AccountSection title="Ativos" accounts={groups.assets} {...sectionProps} />
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
          <AccountSection title="Passivos" accounts={groups.liabilities} {...sectionProps} />
          <AccountSection title="Arquivadas" accounts={groups.archived} {...sectionProps} />
        </div>
      </div>
      {sheet.mode === 'create' ? <AccountSheet onClose={closeSheet} /> : null}
      {sheet.mode === 'edit' ? <AccountSheet account={sheet.account} onClose={closeSheet} /> : null}
      {sheet.mode === 'transfer' ? (
        <TransferSheet accounts={activeAccounts} onClose={closeSheet} />
      ) : null}
      {sheet.mode === 'delete' ? (
        <ConfirmSheet
          title="Excluir conta"
          message={`A conta "${sheet.account.name}" não tem movimentações e será excluída.`}
          confirmLabel="Excluir"
          onConfirm={() => confirmDelete(sheet.account)}
          onDismiss={closeSheet}
        />
      ) : null}
    </div>
  );
}
