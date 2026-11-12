import type { Meta, StoryObj } from '@storybook/react';
import { GradientSurface } from './GradientSurface';

const meta: Meta<typeof GradientSurface> = {
  title: 'Core/GradientSurface',
  component: GradientSurface,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'surface', 'backdrop'] },
    glow: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof GradientSurface>;

const sampleStyle = { width: 240, padding: 'var(--space-4)', color: 'var(--color-text)' };

export const Default: Story = {
  render: (args) => (
    <GradientSurface {...args} style={sampleStyle}>
      GradientSurface
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {(['primary', 'surface', 'backdrop'] as const).map((variant) => (
        <GradientSurface key={variant} variant={variant} style={sampleStyle}>
          {variant}
        </GradientSurface>
      ))}
    </div>
  ),
};
