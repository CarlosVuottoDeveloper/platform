import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export type ToastTone = 'accent' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  tone?: ToastTone;
  title?: ReactNode;
  onDismiss?: () => void;
  children?: ReactNode;
  style?: CSSProperties;
}

const ACCENT_COLOR: Record<ToastTone, string> = {
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

/** Stack several inside a `display: flex; flex-direction: column` wrapper. */
export function Toast({ tone = 'accent', title, onDismiss, children, style }: ToastProps) {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-divider)',
        boxShadow: 'var(--shadow-md)',
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: ACCENT_COLOR[tone],
        }}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 2 }}>
        {title ? (
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-heading-weight)',
              fontSize: 16,
              color: ACCENT_COLOR[tone],
            }}
          >
            {title}
          </div>
        ) : null}
        {children ? (
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-neutral-300)',
            }}
          >
            {children}
          </div>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dispensar"
          style={{
            display: 'flex',
            background: 'none',
            border: 'none',
            padding: 4,
            outlineOffset: -2,
            cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          <Icon name="x" size="sm" />
        </button>
      ) : null}
    </div>
  );
}
