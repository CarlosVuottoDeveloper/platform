import { AreaChart, Card, EmptyState, Icon, StatTile } from '@industry/web';
import { useToday } from '../../hooks/useToday';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { formatMonthShortBR } from '../../domain/calendarDate';
import { formatCents } from '../../domain/money';
import { netWorthByMonth } from '../../domain/netWorth';

export function NetWorthTab() {
  const { accounts, transactions } = useUserData();
  const history = netWorthByMonth(accounts, transactions, useToday());
  const current = history[history.length - 1];

  if (!current) {
    return <EmptyState title="Cadastre uma conta para acompanhar seu patrimônio" />;
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <Card elevation="sm">
          <StatTile
            testID="net-worth-assets"
            icon={<Icon name="trending-up" />}
            label="Ativos"
            value={formatCents(current.assetsCents)}
          />
        </Card>
        <Card elevation="sm">
          <StatTile
            testID="net-worth-liabilities"
            icon={<Icon name="trending-down" />}
            label="Passivos"
            value={formatCents(current.liabilitiesCents)}
          />
        </Card>
        <Card elevation="sm">
          <StatTile
            testID="net-worth-net"
            icon={<Icon name="scale" />}
            label="Patrimônio líquido"
            value={formatCents(current.netCents)}
          />
        </Card>
      </div>
      <Card elevation="sm" title="Evolução do patrimônio líquido">
        <AreaChart
          points={history.map((entry) => ({
            label: formatMonthShortBR(entry.month),
            value: entry.netCents,
          }))}
          valueFormatter={formatCents}
        />
      </Card>
    </div>
  );
}
