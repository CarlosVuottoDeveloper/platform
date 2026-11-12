import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  /** Usually a `<Button>` or `<IconButton>` — receives the click that opens the popover. */
  trigger: ReactNode;
  children?: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: CSSProperties;
}

const SIDE_STYLE: Record<PopoverSide, CSSProperties> = {
  top: { bottom: '100%', marginBottom: 8 },
  bottom: { top: '100%', marginTop: 8 },
  left: { right: '100%', marginRight: 8 },
  right: { left: '100%', marginLeft: 8 },
};

const OPPOSITE: Record<PopoverSide, PopoverSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function alignStyle(side: PopoverSide, align: PopoverAlign): CSSProperties {
  const horizontal = side === 'top' || side === 'bottom';
  if (align === 'start') return horizontal ? { left: 0 } : { top: 0 };
  if (align === 'end') return horizontal ? { right: 0 } : { bottom: 0 };
  return horizontal
    ? { left: '50%', transform: 'translateX(-50%)' }
    : { top: '50%', transform: 'translateY(-50%)' };
}

/** A click-triggered floating panel — use `Menu` instead for a list of actions. */
export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  open: controlledOpen,
  onOpenChange,
  style,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const [resolvedSide, setResolvedSide] = useState(side);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  useLayoutEffect(() => {
    if (!open) {
      setResolvedSide(side);
      return;
    }
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let next = side;
    if (side === 'top' && rect.top < 0) next = OPPOSITE.top;
    else if (side === 'bottom' && rect.bottom > window.innerHeight) next = OPPOSITE.bottom;
    else if (side === 'left' && rect.left < 0) next = OPPOSITE.left;
    else if (side === 'right' && rect.right > window.innerWidth) next = OPPOSITE.right;
    setResolvedSide(next);
  }, [open, side]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex', ...style }}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        style={{ display: 'inline-flex' }}
      >
        {trigger}
      </span>
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          style={{
            position: 'absolute',
            zIndex: 100,
            minWidth: 200,
            padding: 'var(--space-3)',
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            ...SIDE_STYLE[resolvedSide],
            ...alignStyle(resolvedSide, align),
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
