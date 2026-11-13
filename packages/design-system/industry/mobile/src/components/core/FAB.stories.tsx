import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { FAB } from './FAB';

const meta: Meta<typeof FAB> = {
  title: 'Core/FAB',
  component: FAB,
  parameters: { svgKnownIssue: true, gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof FAB>;

export const Default: Story = {
  render: () => (
    <View style={{ padding: 16, alignItems: 'flex-start' }}>
      <FAB label="Novo chamado" />
    </View>
  ),
};

export const Medium: Story = {
  render: () => (
    <View style={{ padding: 16, alignItems: 'flex-start' }}>
      <FAB label="Novo chamado" size="md" />
    </View>
  ),
};

export const Disabled: Story = {
  render: () => (
    <View style={{ padding: 16, alignItems: 'flex-start' }}>
      <FAB label="Novo chamado" disabled />
    </View>
  ),
};
