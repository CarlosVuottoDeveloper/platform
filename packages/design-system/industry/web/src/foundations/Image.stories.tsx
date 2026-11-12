import type { Meta, StoryObj } from '@storybook/react';
import { Duotone } from '../components/core';

const meta: Meta = {
  title: 'Foundations/Image',
};

export default meta;
type Story = StoryObj;

export const DuotoneTreatment: Story = {
  render: () => (
    <figure style={{ margin: 0, maxWidth: 320 }}>
      <div style={{ border: '1px solid var(--color-divider)' }}>
        <Duotone>
          <div
            style={{
              width: '100%',
              height: 220,
              background: 'linear-gradient(135deg, #4a6fa5 0%, #e8b04b 50%, #a53f3f 100%)',
            }}
          />
        </Duotone>
      </div>
      <figcaption
        style={{
          fontSize: 12,
          marginTop: 'var(--space-1)',
          color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
        }}
      >
        Duotone — fotografias são lavadas no acento, como uma serigrafia.
      </figcaption>
    </figure>
  ),
};

export const Usage: Story = {
  render: () => (
    <p style={{ fontSize: 12, opacity: 0.6, maxWidth: '60ch', color: 'var(--color-text)' }}>
      Toda fotografia de conteúdo passa pelo wrapper <code>Duotone</code> — nunca use uma imagem
      crua, sem tratamento.
    </p>
  ),
};
