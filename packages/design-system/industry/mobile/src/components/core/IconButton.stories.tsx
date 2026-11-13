import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Core/IconButton',
  component: IconButton,
  parameters: { svgKnownIssue: true, gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Ghost: Story = {
  render: () => (
    <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
      <IconButton icon="ListFilter" label="Filtrar" />
    </View>
  ),
};

export const Solid: Story = {
  render: () => (
    <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
      <IconButton icon="ListFilter" label="Filtrar" variant="solid" />
    </View>
  ),
};

export const Small: Story = {
  render: () => (
    <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
      <IconButton icon="ListFilter" label="Filtrar" size="sm" />
    </View>
  ),
};

export const Disabled: Story = {
  render: () => (
    <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
      <IconButton icon="ListFilter" label="Filtrar" disabled />
    </View>
  ),
};
