import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart } from './AreaChart';

const meta: Meta<typeof AreaChart> = {
  title: 'Core/AreaChart',
  component: AreaChart,
  parameters: { svgKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

const MONTHS = [
  { label: 'Jan', value: 50 },
  { label: 'Fev', value: 75 },
  { label: 'Mar', value: 40 },
  { label: 'Abr', value: 90 },
  { label: 'Mai', value: 65 },
  { label: 'Jun', value: 110 },
];

export const Default: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <AreaChart points={MONTHS} />
    </View>
  ),
};

export const WithFormatter: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <AreaChart points={MONTHS} height={220} valueFormatter={(value) => `${value} kWh`} />
    </View>
  ),
};

export const Empty: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <AreaChart points={[]} />
    </View>
  ),
};
