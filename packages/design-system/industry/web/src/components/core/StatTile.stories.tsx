import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { GradientSurface } from './GradientSurface';
import { Icon } from './Icon';
import { StatTile } from './StatTile';

const meta: Meta<typeof StatTile> = {
  title: 'Core/StatTile',
  component: StatTile,
};

export default meta;
type Story = StoryObj<typeof StatTile>;

export const WithIcon: Story = {
  render: () => (
    <Card style={{ width: 280 }}>
      <StatTile
        icon={<Icon name="zap" size="md" color="var(--color-accent-300)" />}
        value="48 kWh"
        label="Uso em 24h"
      />
    </Card>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <Card style={{ width: 280 }}>
      <StatTile value="12" label="Dispositivos ativos" />
    </Card>
  ),
};

export const OnPrimary: Story = {
  render: () => (
    <GradientSurface variant="primary" style={{ width: 280, padding: 'var(--space-4)' }}>
      <StatTile
        tone="onPrimary"
        icon={<Icon name="wallet" />}
        value="R$ 12.480,35"
        label="Saldo geral"
      />
    </GradientSurface>
  ),
};
