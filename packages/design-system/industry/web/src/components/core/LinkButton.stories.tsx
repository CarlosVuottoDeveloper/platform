import type { Meta, StoryObj } from '@storybook/react';
import { LinkButton } from './LinkButton';

const meta: Meta<typeof LinkButton> = {
  title: 'Core/LinkButton',
  component: LinkButton,
};

export default meta;
type Story = StoryObj<typeof LinkButton>;

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <LinkButton href="https://example.com" variant="primary" external>
        Vamos conversar
      </LinkButton>
      <LinkButton href="#projetos">Ver projetos</LinkButton>
    </div>
  ),
};
