import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
import { Popover } from './Popover';
import type { PopoverAlign, PopoverSide } from './Popover';

export interface MenuItem {
  key?: string;
  label: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export interface MenuProps {
  /** Usually a `<Button>` or `<IconButton>` — receives the click that opens the menu. */
  trigger: ReactNode;
  /** Small label above the items, e.g. a group heading like "Período". */
  header?: string;
  items?: MenuItem[];
  side?: PopoverSide;
  align?: PopoverAlign;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: CSSProperties;
}

/** Anchored dropdown list of actions. Use `Select` instead for choosing a value. */
export function Menu({
  trigger,
  header,
  items = [],
  side = 'bottom',
  align = 'start',
  open: controlledOpen,
  onOpenChange,
  style,
}: MenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Popover
      trigger={trigger}
      side={side}
      align={align}
      open={open}
      onOpenChange={setOpen}
      style={style}
    >
      <div
        role="menu"
        style={{ display: 'flex', flexDirection: 'column', margin: 'calc(var(--space-3) * -1)' }}
      >
        {header ? (
          <div
            style={{
              padding: 'var(--space-2) var(--space-4) var(--space-1)',
              fontSize: 11,
              color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
            }}
          >
            {header}
          </div>
        ) : null}
        {items.map((item, index) => (
          <MenuItemButton
            key={item.key ?? index}
            item={item}
            onSelect={() => {
              item.onSelect?.();
              setOpen(false);
            }}
          />
        ))}
      </div>
    </Popover>
  );
}

function MenuItemButton({ item, onSelect }: { item: MenuItem; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      role="menuitem"
      aria-current={item.selected ? 'true' : undefined}
      disabled={item.disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        width: '100%',
        minHeight: 'var(--tap)',
        textAlign: 'left',
        padding: '0 var(--space-4)',
        background: item.selected
          ? 'color-mix(in srgb, var(--color-accent) 22%, transparent)'
          : hovered && !item.disabled
            ? 'color-mix(in srgb, var(--color-text) 8%, transparent)'
            : 'transparent',
        border: 0,
        outlineOffset: -2,
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        opacity: item.disabled ? 0.45 : 1,
        font: 'inherit',
        fontSize: 14,
        color: item.selected ? 'var(--color-accent-300)' : 'var(--color-text)',
      }}
    >
      <span style={{ display: 'flex', width: 16, flex: 'none' }}>
        {item.selected ? <Icon name="check" size={16} /> : null}
      </span>
      {item.label}
    </button>
  );
}
