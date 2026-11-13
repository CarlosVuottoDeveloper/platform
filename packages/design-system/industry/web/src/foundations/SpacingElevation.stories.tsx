import type { Meta, StoryObj } from '@storybook/react';
import { GradientSurface } from '../components/core';

const meta: Meta = {
  title: 'Foundations/Spacing & Elevation',
};

export default meta;
type Story = StoryObj;

const SPACE_STEPS = ['1', '2', '3', '4', '6', '8', '12'];

export const Spacing: Story = {
  render: () => (
    <div>
      {SPACE_STEPS.map((step) => (
        <div
          key={step}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: '6px 0' }}
        >
          <span
            style={{
              flex: 'none',
              width: 84,
              fontSize: 10,
              color: 'var(--color-neutral-400)',
            }}
          >
            --space-{step}
          </span>
          <div
            style={{
              height: 12,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent)',
              width: `var(--space-${step})`,
            }}
          />
        </div>
      ))}
    </div>
  ),
};

export const TouchTargets: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'stretch' }}>
      {[
        { height: 'var(--control-h)', name: '--control-h' },
        { height: 'var(--tap)', name: '--tap' },
        { height: 'var(--control-h-sm)', name: '--control-h-sm' },
      ].map(({ height, name }) => (
        <div key={name} style={{ flex: 1 }}>
          <div
            style={{
              height,
              border: '1px solid var(--color-control-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
            }}
          />
          <div style={{ fontSize: 10, marginTop: 6, color: 'var(--color-neutral-400)' }}>
            {name}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      {(['sm', 'md', 'lg', 'pill'] as const).map((size) => (
        <div key={size} style={{ flex: 1 }}>
          <div
            style={{
              height: 56,
              border: '1px solid var(--color-control-border)',
              background: 'var(--color-surface)',
              borderRadius: `var(--radius-${size})`,
            }}
          />
          <div style={{ fontSize: 10, marginTop: 6, color: 'var(--color-neutral-400)' }}>
            --radius-{size}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Elevation: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div
          key={size}
          style={{
            height: 72,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            boxShadow: `var(--shadow-${size})`,
          }}
        />
      ))}
    </div>
  ),
};

export const Glow: Story = {
  render: () => (
    <div>
      <GradientSurface
        variant="primary"
        radius="var(--radius-pill)"
        glow
        style={{ width: 160, height: 48 }}
      />
      <div style={{ fontSize: 10, marginTop: 'var(--space-3)', color: 'var(--color-neutral-400)' }}>
        --glow-accent — só em elementos do tamanho de um botão
      </div>
    </div>
  ),
};
