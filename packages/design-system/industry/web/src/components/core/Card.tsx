import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type CardElevation = 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'title'> {
  kicker?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  meta?: ReactNode;
  elevation?: CardElevation;
  children?: ReactNode;
  style?: CSSProperties;
}

const SHADOW: Record<CardElevation, string> = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
};

export function Card({
  kicker,
  title,
  body,
  meta,
  elevation,
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
        borderRadius: 0,
        background: 'transparent',
        border: '1px solid var(--color-divider)',
        boxShadow: elevation ? SHADOW[elevation] : undefined,
        ...style,
      }}
      {...rest}
    >
      {kicker ? (
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-300)',
          }}
        >
          {kicker}
        </div>
      ) : null}
      {title ? (
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            fontSize: 19,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      ) : null}
      {body ? <p style={{ margin: 0, fontSize: 14, opacity: 0.8, flex: 1 }}>{body}</p> : null}
      {children}
      {meta ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 12,
            color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
          }}
        >
          {meta}
        </div>
      ) : null}
    </div>
  );
}
