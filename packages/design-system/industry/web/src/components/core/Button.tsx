import { useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { PRIMARY_ACTION_FILL, PrimaryActionSurface } from './PrimaryActionSurface';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  selected?: boolean;
  iconOnly?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

function tint(colorVar: string, percent: number) {
  return `color-mix(in srgb, ${colorVar} ${percent}%, transparent)`;
}

function pick(
  pressed: boolean,
  hovered: boolean,
  pressedValue: number,
  hoveredValue: number,
  rest: number,
) {
  return pressed ? pressedValue : hovered ? hoveredValue : rest;
}

function skin(
  variant: ButtonVariant,
  hovered: boolean,
  pressed: boolean,
  selected: boolean,
): CSSProperties {
  if (selected) {
    return {
      color: 'var(--color-text)',
      borderColor: 'var(--color-accent-400)',
      background: tint('var(--color-accent)', pick(pressed, hovered, 28, 22, 16)),
    };
  }
  if (variant === 'primary') {
    return {
      color: 'var(--color-text)',
      borderColor: 'transparent',
      background: PRIMARY_ACTION_FILL,
    };
  }
  if (variant === 'ghost') {
    return {
      color: 'var(--color-accent-300)',
      borderColor: 'transparent',
      background:
        pressed || hovered
          ? tint('var(--color-accent)', pick(pressed, hovered, 22, 14, 0))
          : 'transparent',
    };
  }
  if (variant === 'danger') {
    return {
      color: 'var(--color-danger-300)',
      borderColor: 'transparent',
      background: tint('var(--color-danger-400)', pick(pressed, hovered, 28, 22, 16)),
    };
  }
  return {
    color: 'var(--color-text)',
    borderColor: tint('var(--color-text)', 10),
    background: pressed
      ? 'var(--color-surface)'
      : hovered
        ? 'color-mix(in srgb, var(--color-text) 8%, var(--color-surface-2))'
        : 'var(--color-surface-2)',
  };
}

export function Button({
  variant = 'secondary',
  size = 'md',
  block,
  selected,
  iconOnly,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const height = size === 'sm' ? 'var(--control-h-sm)' : 'var(--control-h)';
  const hasGradient = variant === 'primary' && !selected;
  const isHovered = hovered && !disabled;
  const isPressed = pressed && !disabled;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
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
        minHeight: height,
        width: iconOnly ? height : block ? '100%' : undefined,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textDecoration: 'none',
        fontFamily: 'var(--font-heading)',
        fontWeight: 'var(--font-heading-weight)',
        fontSize: size === 'sm' ? 'var(--text-h6)' : 'var(--text-body)',
        lineHeight: 1.2,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 'var(--radius-pill)',
        padding: iconOnly ? 0 : size === 'sm' ? '0 var(--space-3)' : '0 var(--space-4)',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 120ms ease, border-color 120ms ease',
        ...skin(variant, isHovered, isPressed, Boolean(selected)),
        ...style,
      }}
      {...rest}
    >
      {hasGradient ? (
        <PrimaryActionSurface
          pressed={isPressed}
          hovered={isHovered}
          disabled={Boolean(disabled)}
        />
      ) : null}
      {typeof children === 'string' ? (
        <span
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
