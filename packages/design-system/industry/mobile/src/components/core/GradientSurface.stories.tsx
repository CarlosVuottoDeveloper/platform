import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { color, space } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

const meta: Meta<typeof GradientSurface> = {
  title: 'Core/GradientSurface',
  component: GradientSurface,
  parameters: { gradientKnownIssue: true },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'surface', 'backdrop'] },
    radius: { control: 'number' },
    glow: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof GradientSurface>;

const Sample = () => <Text style={{ color: color.text }}>GradientSurface</Text>;

export const Default: Story = {
  render: (args) => (
    <GradientSurface {...args} style={{ width: 240, padding: space[4] }}>
      <Sample />
    </GradientSurface>
  ),
};

export const Primary: Story = {
  args: { variant: 'primary' },
  render: Default.render,
};

export const WithGlow: Story = {
  args: { variant: 'primary', glow: true },
  render: Default.render,
};

export const Variants: Story = {
  render: () => (
    <View style={{ gap: space[3] }}>
      {(['primary', 'surface', 'backdrop'] as const).map((variant) => (
        <GradientSurface key={variant} variant={variant} style={{ width: 240, padding: space[4] }}>
          <Text style={{ color: color.text }}>{variant}</Text>
        </GradientSurface>
      ))}
    </View>
  ),
};
