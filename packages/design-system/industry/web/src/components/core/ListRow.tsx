import { useState } from 'react';
import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';

export interface ListRowProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'title'> {
  /** Leading slot — icon or avatar. */
  lead?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  /** Trailing slot — badge, chevron, switch. */
  trail?: ReactNode;
  /** `button` (default), `a`, `div` or `li`. */
  as?: ElementType;
  /** Target URL — only meaningful when `as="a"`. */
  href?: string;
  style?: CSSProperties;
}

/** The list unit — 64px tall, one tap target. */
export function ListRow({
  lead,
  title,
  meta,
  trail,
  as: Tag = 'button',
  style,
  ...rest
}: ListRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        minHeight: 64,
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--color-divider)',
        borderLeft: 0,
        borderRight: 0,
        borderTop: 0,
        color: 'inherit',
        textDecoration: 'none',
        textAlign: 'left',
        background: hovered ? 'color-mix(in srgb, var(--color-text) 5%, transparent)' : 'none',
        cursor: 'pointer',
        width: '100%',
        ...style,
      }}
      {...rest}
    >
      {lead ? (
        <span
          style={{
            flex: 'none',
            display: 'grid',
            placeItems: 'center',
            width: 36,
            color: 'var(--color-accent-300)',
          }}
        >
          {lead}
        </span>
      ) : null}
      <span style={{ flex: 1, minWidth: 0, display: 'grid', gap: 2 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
        {meta ? (
          <span
            style={{
              fontSize: 12,
              color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
            }}
          >
            {meta}
          </span>
        ) : null}
      </span>
      {trail ? (
        <span
          style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          {trail}
        </span>
      ) : null}
    </Tag>
  );
}
