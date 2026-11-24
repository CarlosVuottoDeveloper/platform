import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface TopNavLink {
  label: string;
  href: string;
}

export interface TopNavProps {
  brand: ReactNode;
  links: TopNavLink[];
  action?: ReactNode;
  collapsed?: boolean;
  style?: CSSProperties;
}

function TopNavItem({ link }: { link: TopNavLink }) {
  const [hovered, setHovered] = useState(false);

  return (
    <li>
      <a
        href={link.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 'var(--control-h-sm)',
          padding: '0 var(--space-3)',
          borderRadius: 'var(--radius-pill)',
          fontSize: 'var(--text-h6)',
          color: hovered ? 'var(--color-text)' : 'var(--color-neutral-200)',
          textDecoration: 'none',
          transition: 'color 120ms ease',
        }}
      >
        {link.label}
      </a>
    </li>
  );
}

export function TopNav({ brand, links, action, collapsed = false, style }: TopNavProps) {
  return (
    <nav
      aria-label="Principal"
      style={{
        position: 'sticky',
        top: 'var(--space-4)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-2) var(--space-2) var(--space-2) var(--space-6)',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--color-divider)',
        background: 'color-mix(in srgb, var(--color-surface) 72%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-heading-weight)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text)',
          whiteSpace: 'nowrap',
        }}
      >
        {brand}
      </div>
      {collapsed ? null : (
        <ul
          style={{
            display: 'flex',
            gap: 'var(--space-1)',
            listStyle: 'none',
            margin: '0 auto',
            padding: 0,
          }}
        >
          {links.map((link) => (
            <TopNavItem key={link.href} link={link} />
          ))}
        </ul>
      )}
      {action ? <div style={{ marginLeft: 'auto', flexShrink: 0 }}>{action}</div> : null}
    </nav>
  );
}
