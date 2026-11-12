import type { Meta, StoryObj } from '@storybook/react';
import { fontSize } from '@industry/tokens';

const meta: Meta = {
  title: 'Foundations/Typography',
};

export default meta;
type Story = StoryObj;

const HEADINGS = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((tag) => ({
  tag,
  label: `${tag.toUpperCase()} · ${fontSize[tag]}`,
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
            margin: '4px 0',
          }}
        >
          <span
            style={{
              flex: 'none',
              width: 64,
              fontSize: 10,
              opacity: 0.45,
              color: 'var(--color-text)',
            }}
          >
            {label}
          </span>
          <Tag style={{ margin: 0 }}>Um design system de uma só voz</Tag>
        </div>
      ))}
    </div>
  ),
};

export const Body: Story = {
  render: () => (
    <div style={{ color: 'var(--color-text)' }}>
      <p style={{ fontSize: 17, margin: '6px 0' }}>
        Tokens de design descrevem uma aparência uma vez e deixam cada página herdar.
      </p>
      <p style={{ fontSize: 15, margin: '6px 0' }}>
        The quick brown fox jumps over the lazy dog — corpo de texto no tamanho de leitura.
      </p>
      <p className="text-muted" style={{ fontSize: 13, margin: '6px 0' }}>
        Legendas, metadados e notas de rodapé vivem aqui, um degrau mais quietas que o corpo.
      </p>
    </div>
  ),
};
