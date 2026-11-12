import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { PRIMARY_ACTION_FILL, PrimaryActionSurface } from './PrimaryActionSurface';
import { resolveFill, tint, tintedFills, usePressState } from './stateFills';
import type { StateFills } from './stateFills';

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

const SELECTED_FILLS = tintedFills('var(--color-accent)', 16, 22, 28);
const DANGER_FILLS = tintedFills('var(--color-danger-400)', 16, 22, 28);
const GHOST_FILLS: StateFills = {
  rest: 'transparent',
  hovered: tint('var(--color-accent)', 14),
  pressed: tint('var(--color-accent)', 22),
};
const SECONDARY_FILLS: StateFills = {
  rest: 'var(--color-surface-2)',
  hovered: 'color-mix(in srgb, var(--color-text) 8%, var(--color-surface-2))',
  pressed: 'var(--color-neutral-800)',
};

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
      background: resolveFill(SELECTED_FILLS, hovered, pressed),
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
      background: resolveFill(GHOST_FILLS, hovered, pressed),
    };
  }
  if (variant === 'danger') {
    return {
      color: 'var(--color-danger-300)',
      borderColor: 'transparent',
      background: resolveFill(DANGER_FILLS, hovered, pressed),
    };
  }
  return {
    color: 'var(--color-text)',
    borderColor: tint('var(--color-text)', 10),
    background: resolveFill(SECONDARY_FILLS, hovered, pressed),
  };
}

function isTextLabel(children: ReactNode) {
  const isText = (node: ReactNode) => typeof node === 'string' || typeof node === 'number';
  return isText(children) || (Array.isArray(children) && children.every(isText));
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
  const { hovered: isHovered, pressed: isPressed, handlers } = usePressState(disabled);
  const height = size === 'sm' ? 'var(--control-h-sm)' : 'var(--control-h)';
  const hasGradient = variant === 'primary' && !selected;
  const basePadding = size === 'sm' ? 'var(--space-3)' : 'var(--space-4)';
  const horizontalPadding = iconOnly ? 0 : hasGradient ? `calc(${basePadding} + 1px)` : basePadding;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      {...handlers}
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
        borderWidth: hasGradient ? 0 : 1,
        borderStyle: 'solid',
        borderRadius: 'var(--radius-pill)',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
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
      {isTextLabel(children) ? (
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
