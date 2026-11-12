import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { color, neutral } from '@industry/tokens';
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
        <View style={{ width: '100%', height: 220, backgroundColor: color.surface2 }} />
      </Duotone>
      <Text style={{ fontSize: 12, marginTop: 4, color: neutral['400'] }}>
        Duotone — fotografias recebem uma camada translúcida do acento, com cantos arredondados.
      </Text>
    </View>
  ),
};
