import type { CSSProperties, ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  /** Usually a primary `<Button>`. */
  action?: ReactNode;
  style?: CSSProperties;
}

export function EmptyState({ icon, title, body, action, style }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--space-3)',
        justifyItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'var(--color-divider-strong)',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
    >
      {icon ? <div style={{ opacity: 0.8 }}>{icon}</div> : null}
      {title ? (
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            fontSize: 'var(--text-h4)',
          }}
        >
          {title}
        </div>
      ) : null}
      {body ? (
        <p
          style={{
            fontSize: 'var(--text-h6)',
            maxWidth: '42ch',
            color: 'var(--color-neutral-400)',
            margin: 0,
          }}
        >
          {body}
        </p>
      ) : null}
      {action}
    </div>
  );
}
