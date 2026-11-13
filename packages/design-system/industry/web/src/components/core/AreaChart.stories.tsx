import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart } from './AreaChart';

const meta: Meta<typeof AreaChart> = {
  title: 'Core/AreaChart',
  component: AreaChart,
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
    <div style={{ width: 360 }}>
      <AreaChart points={MONTHS} />
    </div>
  ),
};

export const WithFormatter: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <AreaChart points={MONTHS} height={220} valueFormatter={(value) => `${value} kWh`} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <AreaChart points={[]} />
    </div>
  ),
};
