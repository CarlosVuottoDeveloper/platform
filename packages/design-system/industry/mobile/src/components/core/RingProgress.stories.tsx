import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { color, fontFamily, fontSize, fontWeight } from '@industry/tokens';
import { RingProgress } from './RingProgress';

const meta: Meta<typeof RingProgress> = {
  title: 'Core/RingProgress',
  component: RingProgress,
  parameters: { svgKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof RingProgress>;

const percentLabel = (text: string) => (
  <Text
    style={{
      fontFamily: fontFamily.heading,
      fontWeight: fontWeight.heading,
      fontSize: fontSize.h3,
      color: color.text,
    }}
  >
    {text}
  </Text>
);

export const Default: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <RingProgress value={45} centerLabel={percentLabel('45%')} accessibilityLabel="Consumo" />
    </View>
  ),
};

export const Empty: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <RingProgress value={0} centerLabel={percentLabel('0%')} />
    </View>
  ),
};

export const Full: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <RingProgress value={100} size={160} thickness={18} centerLabel={percentLabel('100%')} />
    </View>
  ),
};
