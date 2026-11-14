import type { CSSProperties, ReactNode } from 'react';
import { IconBubble } from './IconBubble';

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
      {icon ? <IconBubble testID={testID ? `${testID}-icon` : undefined}>{icon}</IconBubble> : null}
      <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
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
