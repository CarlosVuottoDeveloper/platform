import { useEffect, useId, useRef } from 'react';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
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
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const CLOSE_MARKER = 'data-sheet-close';
const BACKDROP_MARKER = 'data-sheet-backdrop';

function isUncheckedRadioOfCheckedGroup(element: HTMLElement, container: HTMLElement): boolean {
  if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || element.checked) {
    return false;
  }
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]')).some(
    (radio) => radio.name === element.name && radio.checked,
  );
}

function tabbablesIn(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !isUncheckedRadioOfCheckedGroup(element, container),
  );
}

/** Bottom sheet — positions against its nearest positioned ancestor. */
export function Sheet({ open = true, title, onDismiss, actions, children, style }: SheetProps) {
  const titleId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const tabbables = tabbablesIn(backdropRef.current);
    const firstOfContent = tabbables.find((element) => !element.hasAttribute(CLOSE_MARKER));
    (firstOfContent ?? tabbables[0])?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (backdropRef.current?.querySelector(`[${BACKDROP_MARKER}]`)) return;
      if (e.key === 'Escape') {
        dismissRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const current = tabbablesIn(backdropRef.current);
      const first = current[0];
      const last = current[current.length - 1];
      const index = current.indexOf(document.activeElement as HTMLElement);
      const wrapsBack = e.shiftKey && index <= 0;
      const wrapsForward = !e.shiftKey && (index === -1 || index === current.length - 1);
      if (wrapsBack) {
        e.preventDefault();
        last?.focus();
      } else if (wrapsForward) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return (
    <div
      ref={backdropRef}
      data-sheet-backdrop=""
      onClick={onDismiss}
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
        tabIndex={-1}
        onClick={stopPropagation}
        radius="var(--radius-lg) var(--radius-lg) 0 0"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4) calc(var(--space-6) + var(--safe-b))',
          border: '1px solid var(--color-divider)',
          boxShadow: 'var(--shadow-lg)',
          outline: 'none',
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
