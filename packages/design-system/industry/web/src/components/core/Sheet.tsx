import { useEffect, useId, useRef } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Button } from './Button';
import { GradientSurface } from './GradientSurface';
import { Icon } from './Icon';

export interface SheetProps {
  open?: boolean;
  title?: ReactNode;
  onDismiss?: () => void;
  /** Action row pinned under the content. */
  actions?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const CLOSE_MARKER = 'data-sheet-close';

function focusablesIn(container: HTMLElement | null): HTMLElement[] {
  return container ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
}

/** Bottom sheet — positions against its nearest positioned ancestor. */
export function Sheet({ open = true, title, onDismiss, actions, children, style }: SheetProps) {
  const titleId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusables = focusablesIn(backdropRef.current);
    const firstOfContent = focusables.find((element) => !element.hasAttribute(CLOSE_MARKER));
    (firstOfContent ?? focusables[0])?.focus();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onDismiss?.();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = focusablesIn(backdropRef.current);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={onDismiss}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'color-mix(in srgb, var(--color-bg) 60%, transparent)',
      }}
    >
      <GradientSurface
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={stopPropagation}
        radius="var(--radius-lg) var(--radius-lg) 0 0"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4) calc(var(--space-6) + var(--safe-b))',
          border: '1px solid var(--color-divider)',
          boxShadow: 'var(--shadow-lg)',
          ...style,
        }}
      >
        <div
          style={{
            width: 44,
            height: 3,
            background: 'var(--color-divider-strong)',
            alignSelf: 'center',
          }}
        />
        {title || onDismiss ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {title ? (
              <div
                id={titleId}
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--font-heading-weight)',
                  fontSize: 'var(--text-h4)',
                }}
              >
                {title}
              </div>
            ) : null}
            {onDismiss ? (
              <Button
                size="sm"
                variant="ghost"
                iconOnly
                aria-label="Fechar"
                data-sheet-close=""
                onClick={onDismiss}
                style={{ marginLeft: 'auto' }}
              >
                <Icon name="x" size="md" />
              </Button>
            ) : null}
          </div>
        ) : null}
        {children}
        {actions}
      </GradientSurface>
    </div>
  );
}
