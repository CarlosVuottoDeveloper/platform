import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

const POSITIONS: Record<TooltipSide, CSSProperties> = {
  top: { bottom: '100%', left: '50%', transform: 'translate(-50%, -8px)' },
  bottom: { top: '100%', left: '50%', transform: 'translate(-50%, 8px)' },
  left: { right: '100%', top: '50%', transform: 'translate(-8px, -50%)' },
  right: { left: '100%', top: '50%', transform: 'translate(8px, -50%)' },
};

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  label: string;
  side?: TooltipSide;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Tooltip({ label, side = 'top', children, style, ...rest }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [resolvedSide, setResolvedSide] = useState(side);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!open) {
      setResolvedSide(side);
      return;
    }
    const el = tooltipRef.current;
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
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const wiredChildren = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        'aria-describedby': id,
      })
    : children;

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...rest}
    >
      {wiredChildren}
      <span
        ref={tooltipRef}
        id={id}
        role="tooltip"
        style={{
          position: 'absolute',
          ...POSITIONS[resolvedSide],
          zIndex: 100,
          padding: '5px 9px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-divider-strong)',
          boxShadow: 'var(--shadow-md)',
          fontSize: 12,
          lineHeight: 1.3,
          color: 'var(--color-text)',
          whiteSpace: 'nowrap',
          opacity: open ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 120ms ease',
        }}
      >
        {label}
      </span>
    </span>
  );
}
