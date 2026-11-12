import { Fragment, isValidElement, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { PrimaryActionSurface } from './PrimaryActionSurface';
import { TEXT_TINT_FILLS, resolveFill } from './stateFills';

const ACTIVE_PILL_MARGIN = 'calc((var(--control-h) - var(--control-h-sm)) / 2)';

function isEmptyLabel(label: ReactNode): boolean {
  return label === '' || label == null || label === false;
}

function isStandaloneElement(label: ReactNode): boolean {
  return isValidElement(label) && label.type !== Fragment;
}

interface PillSegmentProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'children' | 'onMouseEnter' | 'onMouseLeave' | 'onMouseDown' | 'onMouseUp'
> {
  as: 'button' | 'label';
  active: boolean;
  focused?: boolean;
  icon?: ReactNode;
  label?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}

export function PillSegment({
  as: Element,
  active,
  focused = false,
  icon,
  label,
  trailing,
  children,
  ...rest
}: PillSegmentProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <Element
      {...(Element === 'button' ? { type: 'button' } : {})}
      {...rest}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: 'relative',
        isolation: 'isolate',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        minHeight: 'var(--control-h)',
        padding: '0 var(--space-4)',
        border: 0,
        borderRadius: 'var(--radius-pill)',
        background: active ? 'transparent' : resolveFill(TEXT_TINT_FILLS, hovered, pressed),
        outline: focused ? '2px solid var(--color-accent)' : undefined,
        outlineOffset: -2,
        font: 'inherit',
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
    >
      {children}
      {active ? (
        <span
          style={{
            position: 'absolute',
            top: ACTIVE_PILL_MARGIN,
            right: ACTIVE_PILL_MARGIN,
            bottom: ACTIVE_PILL_MARGIN,
            left: ACTIVE_PILL_MARGIN,
            pointerEvents: 'none',
          }}
        >
          <PrimaryActionSurface pressed={pressed} hovered={hovered} disabled={false} glow={false} />
        </span>
      ) : null}
      {icon}
      {isEmptyLabel(label) ? null : isStandaloneElement(label) ? (
        label
      ) : (
        <span
          style={{
            fontSize: 14,
            color: active ? 'var(--color-text)' : 'var(--color-neutral-400)',
          }}
        >
          {label}
        </span>
      )}
      {trailing}
    </Element>
  );
}
