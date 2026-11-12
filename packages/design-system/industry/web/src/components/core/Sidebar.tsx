import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { TEXT_TINT_FILLS, resolveFill, usePressState } from './stateFills';
import type { StateFills } from './stateFills';

export interface SidebarItem {
  id?: string;
  label?: ReactNode;
  icon?: ReactNode;
  href?: string;
  /** Renders a group label instead of a link. */
  section?: ReactNode;
}

export interface SidebarProps {
  brand?: ReactNode;
  items?: SidebarItem[];
  /** id (or label) of the active item. */
  current?: string;
  onSelect?: (id: string) => void;
  footer?: ReactNode;
  style?: CSSProperties;
}

const BRAND_STYLE: CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 'var(--font-heading-weight)',
  fontSize: 'var(--text-h4)',
  padding: '0 var(--space-2) var(--space-4)',
};

const ACTIVE_FILLS: StateFills = {
  rest: 'var(--color-accent-800)',
  hovered: 'var(--color-accent-700)',
  pressed: 'var(--color-accent-600)',
};

const SECTION_STYLE: CSSProperties = {
  fontSize: 'var(--text-h6)',
  color: 'var(--color-neutral-400)',
  padding: 'var(--space-4) var(--space-2) var(--space-1)',
};

export function Sidebar({ brand, items = [], current, onSelect, footer, style }: SidebarProps) {
  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        padding: 'var(--space-4) var(--space-3)',
        background: 'var(--color-surface)',
        ...style,
      }}
    >
      {brand ? <div style={BRAND_STYLE}>{brand}</div> : null}
      {items.map((item, index) => {
        if (item.section) {
          return (
            <div key={`section-${index}`} style={SECTION_STYLE}>
              {item.section}
            </div>
          );
        }
        const id = item.id ?? (typeof item.label === 'string' ? item.label : String(index));
        return (
          <SidebarLink
            key={id}
            item={item}
            active={current === id}
            onSelect={onSelect ? () => onSelect(id) : undefined}
          />
        );
      })}
      {footer}
    </nav>
  );
}

function SidebarLink({
  item,
  active,
  onSelect,
}: {
  item: SidebarItem;
  active: boolean;
  onSelect?: () => void;
}) {
  const { hovered, pressed, handlers } = usePressState();

  return (
    <a
      href={item.href ?? '#'}
      aria-current={active ? 'page' : undefined}
      {...handlers}
      onClick={
        onSelect
          ? (e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              onSelect();
            }
          : undefined
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        minHeight: 'var(--tap)',
        padding: '0 var(--space-3)',
        borderRadius: 'var(--radius-pill)',
        color: active
          ? 'var(--color-text)'
          : hovered
            ? 'var(--color-neutral-200)'
            : 'var(--color-neutral-400)',
        textDecoration: 'none',
        fontSize: 'var(--text-body)',
        background: resolveFill(active ? ACTIVE_FILLS : TEXT_TINT_FILLS, hovered, pressed),
      }}
    >
      {item.icon}
      {item.label}
    </a>
  );
}
