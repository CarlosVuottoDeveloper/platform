import type { CSSProperties, ReactNode } from 'react';
import { IconBubble } from './IconBubble';

export type StatTileTone = 'default' | 'onPrimary';

const ON_PRIMARY_BUBBLE = {
  background: 'color-mix(in srgb, var(--color-text) 16%, transparent)',
  color: 'var(--color-text)',
};

export interface StatTileProps {
  icon?: ReactNode;
  value: ReactNode;
  label: ReactNode;
  tone?: StatTileTone;
  style?: CSSProperties;
  testID?: string;
}

export function StatTile({ icon, value, label, tone = 'default', style, testID }: StatTileProps) {
  const onPrimary = tone === 'onPrimary';
  return (
    <div
      data-testid={testID}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', ...style }}
    >
      {icon ? (
        <IconBubble
          testID={testID ? `${testID}-icon` : undefined}
          style={onPrimary ? ON_PRIMARY_BUBBLE : undefined}
        >
          {icon}
        </IconBubble>
      ) : null}
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
            color: onPrimary ? 'var(--color-text)' : 'var(--color-neutral-400)',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
