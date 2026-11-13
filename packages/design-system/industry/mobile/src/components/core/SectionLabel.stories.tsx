import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { color, fontFamily } from '@industry/tokens';
import { SectionLabel } from './SectionLabel';

const meta: Meta<typeof SectionLabel> = {
  title: 'Core/SectionLabel',
  component: SectionLabel,
};

export default meta;
type Story = StoryObj<typeof SectionLabel>;

export const Default: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <SectionLabel>Dados de acesso</SectionLabel>
    </View>
  ),
};

export const WithTrailing: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <SectionLabel
        trailing={<Text style={{ fontFamily: fontFamily.body, color: color.text }}>3 itens</Text>}
      >
        Medicação
      </SectionLabel>
    </View>
  ),
};
