import { useState } from 'react';
import { Button, EmptyState, Icon } from '@industry/web';
import type { IconName } from '@industry/web';
import { AccountSheet } from '../../components/AccountSheet/AccountSheet';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { ACCOUNT_TYPE_LABELS, groupAccounts } from '../../domain/account';
import type { Account } from '../../domain/account';
import { colorVariable } from '../../domain/appearance';
import { setAccountArchived } from '../../services/accountsService';

type SheetState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; account: Account };

interface AccountRowProps {
  account: Account;
  onEdit: () => void;
  onToggleArchived: () => void;
}

function AccountRow({ account, onEdit, onToggleArchived }: AccountRowProps) {
  const archiveLabel = account.archived ? 'Desarquivar' : 'Arquivar';

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) 0',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      <Icon name={account.icon as IconName} color={colorVariable(account.color)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div>{account.name}</div>
        <div style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
          {ACCOUNT_TYPE_LABELS[account.type]}
        </div>
      </div>
      <Button size="sm" variant="ghost" aria-label={`Editar ${account.name}`} onClick={onEdit}>
        Editar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-label={`${archiveLabel} ${account.name}`}
        onClick={onToggleArchived}
      >
        {archiveLabel}
      </Button>
    </li>
  );
}

interface AccountSectionProps {
  title: string;
  accounts: Account[];
  onEdit: (account: Account) => void;
  onToggleArchived: (account: Account) => void;
}

function AccountSection({ title, accounts, onEdit, onToggleArchived }: AccountSectionProps) {
  if (accounts.length === 0) return null;

  return (
    <section aria-label={title}>
      <h2 style={{ fontSize: 'var(--text-h4)' }}>{title}</h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            onEdit={() => onEdit(account)}
            onToggleArchived={() => onToggleArchived(account)}
          />
        ))}
      </ul>
    </section>
  );
}

export function Accounts() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { accounts } = useUserData();
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' });
  const groups = groupAccounts(accounts);

  async function toggleArchived(account: Account) {
    if (!user) return;
    try {
      await setAccountArchived(user.uid, account.id, !account.archived);
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  const sectionProps = {
    onEdit: (account: Account) => setSheet({ mode: 'edit', account }),
    onToggleArchived: toggleArchived,
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Contas</h1>
        <Button variant="primary" onClick={() => setSheet({ mode: 'create' })}>
          Nova conta
        </Button>
      </div>
      {accounts.length === 0 ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          body="Cadastre seu banco, carteira ou cartão para começar a registrar movimentações."
        />
      ) : null}
      <AccountSection title="Ativos" accounts={groups.assets} {...sectionProps} />
      <AccountSection title="Passivos" accounts={groups.liabilities} {...sectionProps} />
      <AccountSection title="Arquivadas" accounts={groups.archived} {...sectionProps} />
      {sheet.mode !== 'closed' ? (
        <AccountSheet
          account={sheet.mode === 'edit' ? sheet.account : undefined}
          onClose={() => setSheet({ mode: 'closed' })}
        />
      ) : null}
    </div>
  );
}
