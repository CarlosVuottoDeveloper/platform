import type { CSSProperties, ReactNode } from 'react';

export interface StatTileProps {
  icon?: ReactNode;
  value: ReactNode;
  label: ReactNode;
  style?: CSSProperties;
  testID?: string;
}

export function StatTile({ icon, value, label, style, testID }: StatTileProps) {
  return (
    <div
      data-testid={testID}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', ...style }}
    >
      {icon ? (
        <div
          data-testid={testID ? `${testID}-icon` : undefined}
          style={{
            width: 'var(--control-h-sm)',
            height: 'var(--control-h-sm)',
            flexShrink: 0,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--color-accent-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      ) : null}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            fontSize: 'var(--text-h4)',
            color: 'var(--color-text)',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-h6)',
            color: 'var(--color-neutral-400)',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
