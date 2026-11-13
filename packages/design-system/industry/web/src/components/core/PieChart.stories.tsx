import type { Meta, StoryObj } from '@storybook/react';
import { PieChart } from './PieChart';

const meta: Meta<typeof PieChart> = {
  title: 'Core/PieChart',
  component: PieChart,
};

export default meta;
type Story = StoryObj<typeof PieChart>;

const SPENDING = [
  { label: 'Alimentação', value: 1250, color: 'var(--viz-5)' },
  { label: 'Moradia', value: 2100, color: 'var(--viz-1)' },
  { label: 'Transporte', value: 480, color: 'var(--viz-2)' },
  { label: 'Lazer', value: 320, color: 'var(--viz-6)' },
];

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <PieChart slices={SPENDING} />
    </div>
  ),
};

export const LegendOnTheRight: Story = {
  render: () => (
    <div style={{ width: 560 }}>
      <PieChart
        slices={SPENDING}
        legendPlacement="right"
        valueFormatter={currency}
        centerLabel={<strong>{currency(4150)}</strong>}
      />
    </div>
  ),
};

export const PercentOnly: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <PieChart slices={SPENDING} legendValue="percent" />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <PieChart slices={[]} />
    </div>
  ),
};
