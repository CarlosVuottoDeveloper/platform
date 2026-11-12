import { useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

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
      background: `color-mix(in srgb, var(--color-accent) ${pressed ? 28 : hovered ? 22 : 16}%, transparent)`,
    };
  }
  if (variant === 'primary') {
    return {
      background: pressed
        ? 'var(--color-accent-500)'
        : hovered
          ? 'var(--color-accent-300)'
          : 'var(--color-accent)',
      color: 'var(--color-bg)',
      borderColor: pressed
        ? 'var(--color-accent-500)'
        : hovered
          ? 'var(--color-accent-300)'
          : 'var(--color-accent)',
    };
  }
  if (variant === 'ghost') {
    return {
      color: 'var(--color-accent-300)',
      borderColor: 'transparent',
      background: pressed
        ? 'color-mix(in srgb, var(--color-accent) 22%, transparent)'
        : hovered
          ? 'color-mix(in srgb, var(--color-accent) 14%, transparent)'
          : 'transparent',
    };
  }
  if (variant === 'danger') {
    return {
      color: 'var(--color-danger-300)',
      borderColor: 'color-mix(in srgb, var(--color-danger) 45%, transparent)',
      background: hovered
        ? 'color-mix(in srgb, var(--color-danger) 16%, transparent)'
        : 'transparent',
    };
  }
  return {
    color: 'var(--color-text)',
    borderColor: hovered || pressed ? 'var(--color-divider-strong)' : 'var(--color-divider)',
    background: pressed
      ? 'color-mix(in srgb, var(--color-text) 14%, transparent)'
      : hovered
        ? 'color-mix(in srgb, var(--color-text) 8%, transparent)'
        : 'transparent',
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

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected === undefined ? undefined : selected}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
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
        fontSize: size === 'sm' ? 14 : 15,
        lineHeight: 1.2,
        border: '1px solid',
        borderRadius: 0,
        padding: iconOnly ? 0 : size === 'sm' ? '0 var(--space-3)' : '0 var(--space-4)',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 120ms ease, border-color 120ms ease',
        ...skin(variant, hovered && !disabled, pressed && !disabled, Boolean(selected)),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
