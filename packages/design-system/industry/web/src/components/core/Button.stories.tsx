import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      <Button size="md">Medium</Button>
      <Button size="sm">Small</Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Button iconOnly aria-label="Fechar">
      <Icon name="x" />
    </Button>
  ),
};

export const Selected: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <Button selected>Admin</Button>
      <Button variant="primary" selected>
        Admin
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <Button variant="primary" disabled>
        Primary
      </Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
    </div>
  ),
};

export const Block: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Button variant="primary" block>
        Block
      </Button>
    </div>
  ),
};
