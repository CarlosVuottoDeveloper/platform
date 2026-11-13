import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { color, neutral, accentRamp } from '@industry/tokens';

const meta: Meta = {
  title: 'Foundations/Color',
};

export default meta;
type Story = StoryObj;

const ROLES = [
  { label: 'bg', value: color.bg },
  { label: 'surface', value: color.surface },
  { label: 'text', value: color.text },
  { label: 'accent', value: color.accent },
];

export const Roles: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {ROLES.map((role) => (
        <View key={role.label} style={{ flex: 1 }}>
          <View
            style={{
              height: 32,
              borderRadius: 2,
              borderWidth: 1,
              borderColor: color.divider,
              backgroundColor: role.value,
            }}
          />
          <Text style={{ fontSize: 10, opacity: 0.5, marginTop: 4, color: color.text }}>
            {role.label}
          </Text>
        </View>
      ))}
    </View>
  ),
};

function Ramp({ label, ramp }: { label: string; ramp: typeof neutral | typeof accentRamp }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 }}>
      <Text style={{ width: 64, fontSize: 10, opacity: 0.45, color: color.text }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
        {Object.entries(ramp).map(([step, hex]) => (
          <View key={step} style={{ flex: 1, height: 22, borderRadius: 2, backgroundColor: hex }} />
        ))}
      </View>
    </View>
  );
}

export const TonalRamps: Story = {
  render: () => (
    <View>
      <Ramp label="Neutral" ramp={neutral} />
      <Ramp label="Accent" ramp={accentRamp} />
    </View>
  ),
};
