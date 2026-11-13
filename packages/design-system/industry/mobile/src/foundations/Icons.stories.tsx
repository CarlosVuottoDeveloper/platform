import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { color, neutral } from '@industry/tokens';
import { Icon, type IconName } from '../components/core';

const meta: Meta = {
  title: 'Foundations/Icons',
  parameters: { svgKnownIssue: true },
};

export default meta;
type Story = StoryObj;

const NAMES: IconName[] = [
  'Sparkle',
  'Layers',
  'Circle',
  'ArrowRight',
  'Search',
  'Settings',
  'User',
  'Heart',
  'Bell',
  'Calendar',
  'Image',
  'Folder',
];

export const LucideSet: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {NAMES.map((name) => (
        <View key={name} style={{ width: 72, alignItems: 'center', gap: 7, paddingVertical: 8 }}>
          <Icon name={name} size="md" color={color.text} />
          <Text style={{ fontSize: 10, color: neutral['400'] }}>{name}</Text>
        </View>
      ))}
    </View>
  ),
};
