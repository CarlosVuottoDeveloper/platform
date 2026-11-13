import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { accentRamp } from '@industry/tokens';
import { Card } from './Card';
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
    <View style={{ padding: 16 }}>
      <Card>
        <StatTile
          icon={<Icon name="Zap" size="md" color={accentRamp['300']} />}
          value="48 kWh"
          label="Uso em 24h"
        />
      </Card>
    </View>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <Card>
        <StatTile value="12" label="Dispositivos ativos" />
      </Card>
    </View>
  ),
};
