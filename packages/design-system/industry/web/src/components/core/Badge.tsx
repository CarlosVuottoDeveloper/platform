import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  /** Semantic tone — hues rotated off the steel accent. */
  tone?: BadgeTone;
  /** Filled instead of outlined. Use for the one status that must shout. */
  solid?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

const OUTLINE_COLOR: Record<BadgeTone, string> = {
  neutral: 'var(--color-neutral-300)',
  accent: 'var(--color-accent)',
  success: 'var(--color-success-300)',
  warning: 'var(--color-warning-300)',
  danger: 'var(--color-danger-300)',
};

const SOLID_BACKGROUND: Partial<Record<BadgeTone, string>> = {
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

export function Badge({ tone = 'neutral', solid, children, style, ...rest }: BadgeProps) {
  const color = solid ? 'var(--color-bg)' : OUTLINE_COLOR[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 'var(--text-h6)',
        padding: '3px 10px',
        fontFamily: 'var(--font-body)',
        borderRadius: 'var(--radius-pill)',
        color,
        border: `1px solid ${solid ? 'transparent' : OUTLINE_COLOR[tone]}`,
        background: solid ? SOLID_BACKGROUND[tone] : 'var(--color-surface-2)',
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          flex: 'none',
          borderRadius: 'var(--radius-pill)',
          background: 'currentColor',
        }}
      />
      {children}
    </span>
  );
}
