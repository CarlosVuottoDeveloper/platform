import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { color, neutral, accentRamp, gradient, radii } from '@industry/tokens';
import type { GradientName } from '@industry/tokens';
import { GradientSurface } from '../components/core';

const meta: Meta = {
  title: 'Foundations/Color',
};

export default meta;
type Story = StoryObj;

const ROLES = [
  { label: 'bg', value: color.bg },
  { label: 'surface', value: color.surface },
  { label: 'surface2', value: color.surface2 },
  { label: 'text', value: color.text },
  { label: 'accent', value: color.accent },
  { label: 'accent2', value: color.accent2 },
  { label: 'divider', value: color.divider },
  { label: 'dividerStrong', value: color.dividerStrong },
  { label: 'controlBorder', value: color.controlBorder },
];

export const Roles: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {ROLES.map((role) => (
        <View key={role.label} style={{ width: 84 }}>
          <View
            style={{
              height: 40,
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: color.controlBorder,
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
          <View
            key={step}
            style={{ flex: 1, height: 22, borderRadius: radii.sm, backgroundColor: hex }}
          />
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

const GRADIENTS = Object.keys(gradient) as GradientName[];

export const Gradients: Story = {
  parameters: { gradientKnownIssue: true },
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {GRADIENTS.map((name) => (
        <View key={name} style={{ flex: 1 }}>
          <GradientSurface variant={name} style={{ height: 72 }} />
          <Text style={{ fontSize: 10, opacity: 0.5, marginTop: 4, color: color.text }}>
            gradient.{name}
          </Text>
        </View>
      ))}
    </View>
  ),
};
