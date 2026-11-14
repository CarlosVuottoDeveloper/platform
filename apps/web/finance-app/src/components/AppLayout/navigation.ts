import type { IconName } from '@industry/web';

export interface NavEntry {
  path: string;
  label: string;
  icon: IconName;
}

const PRIMARY_ENTRIES: NavEntry[] = [
  { path: '/', label: 'Painel', icon: 'layout-dashboard' },
  { path: '/transacoes', label: 'Transações', icon: 'arrow-left-right' },
  { path: '/contas', label: 'Contas', icon: 'wallet' },
  { path: '/orcamentos', label: 'Orçamentos', icon: 'piggy-bank' },
];

export const MORE_ENTRIES: NavEntry[] = [
  { path: '/metas', label: 'Metas', icon: 'target' },
  { path: '/relatorios', label: 'Relatórios', icon: 'chart-pie' },
  { path: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

export const MORE_PATH = '/mais';

export const SIDEBAR_ENTRIES: NavEntry[] = [...PRIMARY_ENTRIES, ...MORE_ENTRIES];

export const TAB_BAR_ENTRIES: NavEntry[] = [
  ...PRIMARY_ENTRIES,
  { path: MORE_PATH, label: 'Mais', icon: 'ellipsis' },
];

export function currentTab(pathname: string): string {
  return MORE_ENTRIES.some((entry) => entry.path === pathname) ? MORE_PATH : pathname;
}
