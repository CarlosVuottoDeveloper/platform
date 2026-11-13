import { Outlet, useLocation, useNavigate } from 'react-router';
import { AppShell, Button, Icon, Sidebar, TabBar } from '@industry/web';
import type { IconName } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useIsWideScreen } from '../../hooks/useIsWideScreen';

interface NavEntry {
  path: string;
  label: string;
  icon: IconName;
}

export const NAV_ENTRIES: NavEntry[] = [
  { path: '/', label: 'Painel', icon: 'layout-dashboard' },
  { path: '/transacoes', label: 'Transações', icon: 'arrow-left-right' },
  { path: '/contas', label: 'Contas', icon: 'wallet' },
  { path: '/orcamentos', label: 'Orçamentos', icon: 'piggy-bank' },
  { path: '/metas', label: 'Metas', icon: 'target' },
  { path: '/relatorios', label: 'Relatórios', icon: 'chart-pie' },
  { path: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

export function AppLayout() {
  const { logout } = useAuth();
  const isWide = useIsWideScreen();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (isWide) {
    return (
      <AppShell
        style={{ minHeight: '100vh' }}
        sidebar={
          <Sidebar
            brand="Finanças"
            current={pathname}
            onSelect={navigate}
            items={NAV_ENTRIES.map((entry) => ({
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
      </AppShell>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: 'var(--space-4)' }}>
        <Outlet />
      </main>
      <TabBar
        style={{ position: 'sticky', bottom: 0, overflowX: 'auto' }}
        current={pathname}
        onSelect={navigate}
        items={NAV_ENTRIES.map((entry) => ({
          id: entry.path,
          label: entry.label,
          icon: <Icon name={entry.icon} size="sm" />,
        }))}
      />
    </div>
  );
}
