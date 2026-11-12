import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { PrimaryActionSurface } from './PrimaryActionSurface';

export interface TabBarItem {
  id?: string;
  label?: ReactNode;
  icon?: ReactNode;
}

export interface TabBarProps {
  items?: TabBarItem[];
  current?: string;
  onSelect?: (id: string) => void;
  style?: CSSProperties;
}

/** Bottom navigation bar. Respects the safe-area inset. */
export function TabBar({ items = [], current, onSelect, style }: TabBarProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
        background: 'var(--color-surface)',
        paddingTop: 'var(--space-2)',
        paddingBottom: 'calc(var(--space-2) + var(--safe-b))',
        ...style,
      }}
    >
      {items.map((item, index) => {
        const id = item.id ?? (typeof item.label === 'string' ? item.label : String(index));
        return (
          <TabBarButton
            key={id}
            item={item}
            active={current === id}
            onSelect={onSelect ? () => onSelect(id) : undefined}
          />
        );
      })}
    </div>
  );
}

function iconOpacity(active: boolean, hovered: boolean) {
  if (active) return 1;
  return hovered ? 0.85 : 0.6;
}

function labelColor(active: boolean, hovered: boolean) {
  if (active) return 'var(--color-accent-300)';
  return hovered ? 'var(--color-neutral-200)' : 'var(--color-neutral-400)';
}

function TabBarButton({
  item,
  active,
  onSelect,
}: {
  item: TabBarItem;
  active: boolean;
  onSelect?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1)',
        minHeight: 'var(--tap)',
        padding: 0,
        background: 'none',
        border: 0,
        font: 'inherit',
        cursor: 'pointer',
      }}
    >
      {item.icon ? (
        <span
          style={{
            position: 'relative',
            isolation: 'isolate',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'var(--tap)',
            height: 'var(--tap)',
            color: 'var(--color-text)',
            opacity: iconOpacity(active, hovered),
          }}
        >
          {active ? <PrimaryActionSurface pressed={pressed} disabled={false} /> : null}
          {item.icon}
        </span>
      ) : null}
      {item.label ? (
        <span
          style={{
            fontSize: 'var(--text-h6)',
            color: labelColor(active, hovered),
            fontWeight: active ? 'var(--font-medium-weight)' : undefined,
          }}
        >
          {item.label}
        </span>
      ) : null}
    </button>
  );
}
