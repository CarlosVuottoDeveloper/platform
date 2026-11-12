import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { color } from '@industry/tokens';
import { Duotone } from '../components/core';

const meta: Meta = {
  title: 'Foundations/Image',
};

export default meta;
type Story = StoryObj;

export const DuotoneTreatment: Story = {
  render: () => (
    <View style={{ maxWidth: 320 }}>
      <Duotone>
        <View style={{ width: '100%', height: 220, backgroundColor: color.surface }} />
      </Duotone>
      <Text style={{ fontSize: 12, marginTop: 4, color: color.text, opacity: 0.55 }}>
        Duotone — fotografias são lavadas no acento, como uma serigrafia.
      </Text>
    </View>
  ),
};
