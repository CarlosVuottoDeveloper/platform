import type { Meta, StoryObj } from '@storybook/react';
import { GradientSurface } from '../components/core';

const meta: Meta = {
  title: 'Foundations/Color',
};

export default meta;
type Story = StoryObj;

const ROLES = [
  { label: 'bg', value: 'var(--color-bg)' },
  { label: 'surface', value: 'var(--color-surface)' },
  { label: 'surface-2', value: 'var(--color-surface-2)' },
  { label: 'text', value: 'var(--color-text)' },
  { label: 'accent', value: 'var(--color-accent)' },
  { label: 'accent-2', value: 'var(--color-accent-2)' },
  { label: 'divider', value: 'var(--color-divider)' },
  { label: 'divider-strong', value: 'var(--color-divider-strong)' },
  { label: 'control-border', value: 'var(--color-control-border)' },
];

const GRADIENTS = ['primary', 'surface', 'backdrop'] as const;

const RAMP_STEPS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

export const Roles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
      {ROLES.map((role) => (
        <div key={role.label} style={{ width: 92 }}>
          <div
            style={{
              height: 40,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-control-border)',
              background: role.value,
            }}
          />
          <div style={{ fontSize: 10, marginTop: 4, color: 'var(--color-neutral-400)' }}>
            {role.label}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const TonalRamps: Story = {
  render: () => (
    <div>
      {(['neutral', 'accent'] as const).map((prefix) => (
        <div
          key={prefix}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            margin: 'var(--space-2) 0',
          }}
        >
          <span
            style={{
              flex: 'none',
              width: 64,
              fontSize: 10,
              color: 'var(--color-neutral-400)',
              textTransform: 'capitalize',
            }}
          >
            {prefix}
          </span>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            {RAMP_STEPS.map((step) => (
              <div
                key={step}
                title={step}
                style={{
                  flex: 1,
                  height: 22,
                  borderRadius: 'var(--radius-sm)',
                  background: `var(--color-${prefix}-${step})`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Gradients: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      {GRADIENTS.map((name) => (
        <div key={name} style={{ flex: 1 }}>
          <GradientSurface variant={name} style={{ height: 72 }} />
          <div style={{ fontSize: 10, marginTop: 4, color: 'var(--color-neutral-400)' }}>
            --gradient-{name}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Usage: Story = {
  render: () => (
    <p style={{ fontSize: 12, maxWidth: '60ch', color: 'var(--color-neutral-400)' }}>
      Sobre o fundo azul-noite, <code>300</code> é o passo legível para texto e ícones em acento,{' '}
      <code>400</code> é o preenchimento (barras, pontos, seleção), <code>800</code> tinge uma
      superfície ativa e 100–200 são para texto sobre esses preenchimentos. 500–700 são os passos de
      hover e pressed. Campos e controles em repouso usam <code>--color-control-border</code>.
      Prefira um passo da rampa a montar um <code>color-mix()</code> improvisado. As três rampas
      semânticas — success, warning e danger — estão em Foundations/Semantics.
    </p>
  ),
};
