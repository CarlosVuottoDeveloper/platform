import type { Meta, StoryObj } from '@storybook/react';
import { RingProgress } from './RingProgress';

const meta: Meta<typeof RingProgress> = {
  title: 'Core/RingProgress',
  component: RingProgress,
};

export default meta;
type Story = StoryObj<typeof RingProgress>;

const percentLabel = (text: string) => (
  <span
    style={{
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--font-heading-weight)',
      fontSize: 'var(--text-h3)',
      color: 'var(--color-text)',
    }}
  >
    {text}
  </span>
);

export const Default: Story = {
  render: () => (
    <RingProgress value={45} centerLabel={percentLabel('45%')} accessibilityLabel="Consumo" />
  ),
};

export const Empty: Story = {
  render: () => <RingProgress value={0} centerLabel={percentLabel('0%')} />,
};

export const Full: Story = {
  render: () => (
    <RingProgress value={100} size={160} thickness={18} centerLabel={percentLabel('100%')} />
  ),
};
