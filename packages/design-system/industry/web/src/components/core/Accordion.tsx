import { useId, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export interface AccordionItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items?: AccordionItem[];
  /** Allow more than one item open at once. Default: only one at a time. */
  multiple?: boolean;
  defaultOpenKeys?: string[];
  openKeys?: string[];
  onOpenKeysChange?: (keys: string[]) => void;
  style?: CSSProperties;
}

export function Accordion({
  items = [],
  multiple = false,
  defaultOpenKeys = [],
  openKeys: controlledOpenKeys,
  onOpenKeysChange,
  style,
}: AccordionProps) {
  const [uncontrolledOpenKeys, setUncontrolledOpenKeys] = useState(defaultOpenKeys);
  const openKeys = controlledOpenKeys ?? uncontrolledOpenKeys;

  function toggle(key: string) {
    const isOpen = openKeys.includes(key);
    const next = isOpen ? openKeys.filter((k) => k !== key) : multiple ? [...openKeys, key] : [key];
    if (controlledOpenKeys === undefined) setUncontrolledOpenKeys(next);
    onOpenKeysChange?.(next);
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
    >
      {items.map((item, index) => (
        <AccordionSection
          key={item.key}
          item={item}
          last={index === items.length - 1}
          open={openKeys.includes(item.key)}
          onToggle={() => toggle(item.key)}
        />
      ))}
    </div>
  );
}

function AccordionSection({
  item,
  last,
  open,
  onToggle,
}: {
  item: AccordionItem;
  last: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  const headerId = `${id}-header`;
  const panelId = `${id}-panel`;

  return (
    <div style={{ borderBottom: last ? undefined : '1px solid var(--color-divider)' }}>
      <h3 style={{ margin: 0 }}>
        <button
          id={headerId}
          type="button"
          disabled={item.disabled}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            minHeight: 'var(--tap)',
            padding: 'var(--space-4) var(--space-3)',
            background: 'none',
            border: 'none',
            font: 'inherit',
            fontSize: 15,
            color: 'var(--color-text)',
            textAlign: 'left',
            opacity: item.disabled ? 0.45 : 1,
            cursor: item.disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {item.title}
          <Icon
            name="chevron-down"
            size="sm"
            color="var(--color-text)"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!open}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '0 var(--space-3) var(--space-4)',
              fontSize: 14,
              color: 'var(--color-text)',
            }}
          >
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
}
