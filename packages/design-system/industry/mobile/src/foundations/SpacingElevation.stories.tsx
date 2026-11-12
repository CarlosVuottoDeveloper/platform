import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { color, space, control, glow, radii, shadow } from '@industry/tokens';
import { GradientSurface } from '../components/core';

const meta: Meta = {
  title: 'Foundations/Spacing & Elevation',
};

export default meta;
type Story = StoryObj;

export const Spacing: Story = {
  render: () => (
    <View>
      {Object.entries(space).map(([step, px]) => (
        <View
          key={step}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 3 }}
        >
          <Text style={{ width: 84, fontSize: 10, opacity: 0.45, color: color.text }}>
            space.{step}
          </Text>
          <View
            style={{
              height: 12,
              borderRadius: radii.pill,
              backgroundColor: color.accent,
              width: px,
            }}
          />
        </View>
      ))}
    </View>
  ),
};

export const TouchTargets: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: control.height,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: color.controlBorder,
            backgroundColor: color.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 12, color: color.text }}>{control.height}px</Text>
        </View>
        <Text style={{ fontSize: 10, opacity: 0.5, marginTop: 6, color: color.text }}>
          control.height · control.tap
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: control.heightSm,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: color.controlBorder,
            backgroundColor: color.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 12, color: color.text }}>{control.heightSm}px</Text>
        </View>
        <Text style={{ fontSize: 10, opacity: 0.5, marginTop: 6, color: color.text }}>
          control.heightSm · chrome de tabela
        </Text>
      </View>
    </View>
  ),
};

export const Radius: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {Object.entries(radii).map(([key, value]) => (
        <View key={key} style={{ flex: 1 }}>
          <View
            style={{
              height: 56,
              borderWidth: 1,
              borderColor: color.controlBorder,
              backgroundColor: color.surface,
              borderRadius: value,
            }}
          />
          <Text style={{ fontSize: 10, opacity: 0.5, marginTop: 6, color: color.text }}>
            radii.{key}
          </Text>
        </View>
      ))}
    </View>
  ),
};

export const Elevation: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <View
          key={size}
          style={{
            flex: 1,
            height: 72,
            borderRadius: radii.md,
            backgroundColor: color.surface,
            ...shadow[size],
          }}
        />
      ))}
    </View>
  ),
};

export const Glow: Story = {
  parameters: { gradientKnownIssue: true },
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, padding: space[4] }}>
      <View style={{ flex: 1 }}>
        <GradientSurface
          variant="primary"
          radius={radii.pill}
          glow
          style={{ height: control.height }}
        />
        <Text style={{ fontSize: 10, opacity: 0.5, marginTop: 10, color: color.text }}>
          glow.accent · {glow.accent}
        </Text>
      </View>
    </View>
  ),
};
