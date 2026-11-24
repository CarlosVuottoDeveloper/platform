import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

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

function TopNavItem({
  link,
  minHeight,
  onNavigate,
}: {
  link: TopNavLink;
  minHeight: string;
  onNavigate?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <li>
      <a
        href={link.href}
        onClick={onNavigate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          minHeight,
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

function useDismissMenu(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  close: (options: { restoreFocus: boolean }) => void,
) {
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close({ restoreFocus: false });
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      close({ restoreFocus: Boolean(rootRef.current?.contains(document.activeElement)) });
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, rootRef, close]);
}

export function TopNav({ brand, links, action, collapsed = false, style }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wasCollapsed, setWasCollapsed] = useState(collapsed);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const showPanel = collapsed && menuOpen;

  if (collapsed !== wasCollapsed) {
    setWasCollapsed(collapsed);
    setMenuOpen(false);
  }

  const closeMenu = useCallback(({ restoreFocus }: { restoreFocus: boolean }) => {
    setMenuOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useDismissMenu(showPanel, navRef, closeMenu);

  return (
    <nav
      ref={navRef}
      aria-label="Principal"
      style={{
        position: 'sticky',
        top: 'var(--space-4)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 'var(--space-2)' : 'var(--space-4)',
        padding: `var(--space-2) var(--space-2) var(--space-2) ${collapsed ? 'var(--space-4)' : 'var(--space-6)'}`,
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
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
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
            <TopNavItem key={link.href} link={link} minHeight="var(--control-h-sm)" />
          ))}
        </ul>
      )}
      {action || collapsed ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginLeft: 'auto',
            flexShrink: 0,
          }}
        >
          {action}
          {collapsed ? (
            <Button
              ref={toggleRef}
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={showPanel}
              aria-controls={showPanel ? panelId : undefined}
              onClick={() => setMenuOpen((open) => !open)}
              style={{ width: 'var(--tap)', minHeight: 'var(--tap)' }}
            >
              <Icon name={menuOpen ? 'x' : 'menu'} size="md" />
            </Button>
          ) : null}
        </div>
      ) : null}
      {showPanel ? (
        <ul
          id={panelId}
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-2))',
            left: 0,
            right: 0,
            display: 'grid',
            gap: 'var(--space-1)',
            listStyle: 'none',
            margin: 0,
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-divider)',
            background: 'var(--color-surface)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {links.map((link) => (
            <TopNavItem
              key={link.href}
              link={link}
              minHeight="var(--tap)"
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
