import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Icon } from './Icon';
import { Button } from './Button';
import { color } from '@industry/tokens';

const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
  parameters: { svgKnownIssue: true, gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      <Button size="md">Medium</Button>
      <Button size="sm">Small</Button>
    </View>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Button iconOnly accessibilityLabel="Fechar">
      <Icon name="X" size="sm" color={color.text} />
    </Button>
  ),
};

export const Selected: Story = {
  render: () => <Button selected>Selecionado</Button>,
};

export const Disabled: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Button variant="primary" disabled>
        Primary
      </Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
    </View>
  ),
};

export const Block: Story = {
  render: () => (
    <View style={{ width: 280 }}>
      <Button variant="primary" block>
        Block
      </Button>
    </View>
  ),
};
