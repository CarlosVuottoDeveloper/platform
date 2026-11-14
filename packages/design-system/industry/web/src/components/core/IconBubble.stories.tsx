import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { IconBubble } from './IconBubble';

const meta: Meta<typeof IconBubble> = {
  title: 'Core/IconBubble',
  component: IconBubble,
};

export default meta;
type Story = StoryObj<typeof IconBubble>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <IconBubble size="sm">
        <Icon name="trending-down" />
      </IconBubble>
      <IconBubble>
        <Icon name="wallet" size="md" />
      </IconBubble>
    </div>
  ),
};
