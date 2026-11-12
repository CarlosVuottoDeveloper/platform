import type { Meta, StoryObj } from '@storybook/react';
import { fontSize } from '@industry/tokens';

const meta: Meta = {
  title: 'Foundations/Typography',
};

export default meta;
type Story = StoryObj;

const HEADINGS = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((tag) => ({
  tag,
  label: `${tag} · ${fontSize[tag]}`,
}));

export const Headings: Story = {
  render: () => (
    <div>
      {HEADINGS.map(({ tag: Tag, label }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-3)',
            margin: 'var(--space-1) 0',
          }}
        >
          <span
            style={{
              flex: 'none',
              width: 64,
              fontSize: 10,
              color: 'var(--color-neutral-400)',
            }}
          >
            {label}
          </span>
          <Tag style={{ margin: 0, textTransform: 'none' }}>Um design system de uma só voz</Tag>
        </div>
      ))}
    </div>
  ),
};

export const Body: Story = {
  render: () => (
    <div style={{ color: 'var(--color-text)' }}>
      <p style={{ fontSize: 'var(--text-h4)', margin: '6px 0' }}>
        Tokens de design descrevem uma aparência uma vez e deixam cada página herdar.
      </p>
      <p style={{ fontSize: 'var(--text-body)', margin: '6px 0' }}>
        The quick brown fox jumps over the lazy dog — corpo de texto no tamanho de leitura.
      </p>
      <p style={{ fontSize: 'var(--text-h6)', margin: '6px 0', color: 'var(--color-neutral-400)' }}>
        Legendas, metadados e notas de rodapé vivem aqui, um degrau mais quietas que o corpo.
      </p>
    </div>
  ),
};
