import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './BarChart';

const meta: Meta<typeof BarChart> = {
  title: 'Core/BarChart',
  component: BarChart,
};

export default meta;
type Story = StoryObj<typeof BarChart>;

const SERIES = [
  { label: 'Receitas', color: 'var(--viz-3)' },
  { label: 'Despesas', color: 'var(--viz-5)' },
];
const MONTHS = [
  { label: 'Jan', values: [5200, 4100] },
  { label: 'Fev', values: [5200, 3800] },
  { label: 'Mar', values: [6100, 4900] },
  { label: 'Abr', values: [5200, 5600] },
  { label: 'Mai', values: [5900, 4300] },
  { label: 'Jun', values: [5200, 3900] },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <BarChart series={SERIES} groups={MONTHS} />
    </div>
  ),
};

export const SingleSeries: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <BarChart
        series={[{ label: 'Despesas', color: 'var(--viz-1)' }]}
        groups={MONTHS.map((month) => ({ label: month.label, values: [month.values[1] ?? 0] }))}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <BarChart series={SERIES} groups={[]} />
    </div>
  ),
};
