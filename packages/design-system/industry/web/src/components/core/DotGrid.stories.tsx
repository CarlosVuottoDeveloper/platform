import type { Meta, StoryObj } from '@storybook/react';
import { DotGrid } from './DotGrid';

const meta: Meta<typeof DotGrid> = {
  title: 'Core/DotGrid',
  component: DotGrid,
};

export default meta;
type Story = StoryObj<typeof DotGrid>;

const MONTH = [
  0.1, 0.8, 0.5, 0, 0.9, 0, 0.2, 0.95, 0, 0.5, 0, 0.85, 0.4, 0.1, 0.5, 0, 0.45, 0.9, 0, 0.5, 0.4, 0,
  0.5, 0.9, 0, 0.1, 0.45, 0.6, 0, 0.85,
];
const YEAR = Array.from({ length: 84 }, (_, index) => ((index * 37) % 100) / 100);

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <DotGrid
        values={MONTH}
        columns={10}
        legend={{ low: 'Menos', high: 'Mais' }}
        label="Gastos por dia em novembro"
      />
    </div>
  ),
};

export const Decorative: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <DotGrid values={YEAR} columns={14} />
    </div>
  ),
};
