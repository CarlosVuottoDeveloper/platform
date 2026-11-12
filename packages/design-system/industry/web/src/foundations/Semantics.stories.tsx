import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Semantics',
};

export default meta;
type Story = StoryObj;

const STEPS = ['200', '300', '400', '700', '900'];
const ROLES = ['success', 'warning', 'danger', 'accent'];

export const SemanticRamps: Story = {
  render: () => (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '92px repeat(5, 1fr)',
          gap: 'var(--space-1)',
          fontSize: 10,
          marginBottom: 'var(--space-2)',
          color: 'var(--color-neutral-400)',
        }}
      >
        <span />
        {STEPS.map((step) => (
          <span key={step} style={{ textAlign: 'center' }}>
            {step}
          </span>
        ))}
      </div>
      {ROLES.map((role) => (
        <div
          key={role}
          style={{
            display: 'grid',
            gridTemplateColumns: '92px repeat(5, 1fr)',
            gap: 1,
            marginBottom: 1,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-neutral-400)',
              display: 'flex',
              alignItems: 'center',
              textTransform: 'capitalize',
            }}
          >
            {role}
          </span>
          {STEPS.map((step) => (
            <i
              key={step}
              style={{
                height: 40,
                display: 'block',
                borderRadius: 'var(--radius-sm)',
                background: `var(--color-${role}-${step})`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

const BADGES = [
  { label: 'Draft', tone: 'neutral' },
  { label: 'In review', tone: 'accent' },
  { label: 'Resolved', tone: 'success' },
  { label: 'Waiting', tone: 'warning' },
  { label: 'Overdue', tone: 'danger' },
];

export const InUse: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      {BADGES.map(({ label, tone }) => (
        <span
          key={label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: 'var(--space-1) var(--space-3)',
            fontSize: 12,
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-divider)',
            color: tone === 'neutral' ? 'var(--color-text)' : `var(--color-${tone}-300)`,
          }}
        >
          {label}
        </span>
      ))}
    </div>
  ),
};

export const DataVizSeries: Story = {
  render: () => (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <i
            key={n}
            style={{
              flex: 1,
              height: 56,
              display: 'block',
              borderRadius: 'var(--radius-sm)',
              background: `var(--viz-${n})`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          fontSize: 10,
          marginTop: 5,
          color: 'var(--color-neutral-400)',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span key={n} style={{ flex: 1, textAlign: 'center' }}>
            {n}
          </span>
        ))}
      </div>
    </div>
  ),
};
