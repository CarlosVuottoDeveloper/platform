import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AppShell, Button, Icon, Sidebar, TabBar } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useIsWideScreen } from '../../hooks/useIsWideScreen';
import { TransactionSheet } from '../TransactionSheet/TransactionSheet';
import { SIDEBAR_ENTRIES, TAB_BAR_ENTRIES, currentTab } from './navigation';

export function AppLayout() {
  const { logout } = useAuth();
  const isWide = useIsWideScreen();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [addingTransaction, setAddingTransaction] = useState(false);
  const transactionSheet = addingTransaction ? (
    <TransactionSheet onClose={() => setAddingTransaction(false)} />
  ) : null;
  const newTransactionButton = (
    <Button variant="primary" onClick={() => setAddingTransaction(true)}>
      Nova movimentação
    </Button>
  );

  if (isWide) {
    return (
      <AppShell
        style={{ minHeight: '100vh' }}
        header={<div style={{ marginLeft: 'auto' }}>{newTransactionButton}</div>}
        sidebar={
          <Sidebar
            brand="Finanças"
            current={pathname}
            onSelect={navigate}
            items={SIDEBAR_ENTRIES.map((entry) => ({
              id: entry.path,
              href: entry.path,
              label: entry.label,
              icon: <Icon name={entry.icon} size="sm" />,
            }))}
            footer={
              <Button variant="ghost" onClick={logout} style={{ marginTop: 'auto' }}>
                Sair
              </Button>
            }
          />
        }
      >
        <main>
          <Outlet />
        </main>
        {transactionSheet}
      </AppShell>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: 'var(--space-4)' }}>
        <Outlet />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-6)' }}>
          {newTransactionButton}
        </div>
      </main>
      {transactionSheet}
      <TabBar
        style={{ position: 'sticky', bottom: 0 }}
        current={currentTab(pathname)}
        onSelect={navigate}
        items={TAB_BAR_ENTRIES.map((entry) => ({
          id: entry.path,
          label: entry.label,
          icon: <Icon name={entry.icon} size="sm" />,
        }))}
      />
    </div>
  );
}
