import { useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  items?: Crumb[];
  style?: CSSProperties;
}

const CRUMB_STYLE: CSSProperties = { fontSize: 'var(--text-h6)' };

export function Breadcrumbs({ items = [], style, ...rest }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
        ...style,
      }}
      {...rest}
    >
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span
            key={item.label}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            {last ? (
              <span aria-current="page" style={{ ...CRUMB_STYLE, color: 'var(--color-text)' }}>
                {item.label}
              </span>
            ) : (
              <PreviousCrumb item={item} />
            )}
            {!last ? (
              <span
                aria-hidden="true"
                style={{ ...CRUMB_STYLE, color: 'var(--color-neutral-600)' }}
              >
                /
              </span>
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}

function PreviousCrumb({ item }: { item: Crumb }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={item.href ?? '#'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...CRUMB_STYLE,
        color: hovered ? 'var(--color-neutral-200)' : 'var(--color-neutral-400)',
        textDecoration: 'none',
      }}
    >
      {item.label}
    </a>
  );
}
