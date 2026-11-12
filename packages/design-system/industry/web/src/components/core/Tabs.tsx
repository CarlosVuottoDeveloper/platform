import type { CSSProperties, ReactNode } from 'react';
import { PillSegment } from './PillSegment';

export interface TabItem {
  id?: string;
  label?: ReactNode;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps {
  items?: (string | TabItem)[];
  current?: string;
  onSelect?: (id: string) => void;
  style?: CSSProperties;
}

function resolveTab(item: string | TabItem): TabItem {
  return typeof item === 'string' ? { id: item, label: item } : item;
}

function TabCount({ count }: { count: number }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--color-surface-2)',
        color: 'var(--color-neutral-200)',
      }}
    >
      {count}
    </span>
  );
}

export function Tabs({ items = [], current, onSelect, style }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        maxWidth: '100%',
        overflowX: 'auto',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-pill)',
        ...style,
      }}
    >
      {items.map((item, index) => {
        const tab = resolveTab(item);
        const id = tab.id ?? (typeof tab.label === 'string' ? tab.label : String(index));
        const active = current === id;
        return (
          <PillSegment
            key={id}
            as="button"
            scrollable
            role="tab"
            aria-selected={active}
            active={active}
            onClick={onSelect ? () => onSelect(id) : undefined}
            icon={tab.icon}
            label={tab.label}
            trailing={tab.count != null ? <TabCount count={tab.count} /> : undefined}
          />
        );
      })}
    </div>
  );
}
