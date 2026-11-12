import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { color, neutral } from '@industry/tokens';
import { Icon } from './Icon';
import { TabBar } from './TabBar';

const meta: Meta<typeof TabBar> = {
  title: 'Core/TabBar',
  component: TabBar,
  parameters: { gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

export const Default: Story = {
  render: () => (
    <View style={{ width: 360 }}>
      <TabBar
        current="home"
        items={[
          { id: 'home', label: 'Início', icon: <Icon name="House" color={color.text} /> },
          { id: 'search', label: 'Buscar', icon: <Icon name="Search" color={neutral['400']} /> },
          { id: 'profile', label: 'Perfil', icon: <Icon name="User" color={neutral['400']} /> },
        ]}
      />
    </View>
  ),
};
