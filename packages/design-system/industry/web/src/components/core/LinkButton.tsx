import type { CSSProperties, ReactNode } from 'react';
import { ButtonContent, buttonSurfaceStyle, hasGradientSurface } from './Button';
import type { ButtonSize, ButtonVariant } from './Button';
import { usePressState } from './stateFills';

export interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function LinkButton({
  href,
  variant = 'secondary',
  size = 'md',
  external = false,
  children,
  style,
  'aria-label': ariaLabel,
}: LinkButtonProps) {
  const { hovered, pressed, handlers } = usePressState();

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      {...handlers}
      style={{
        ...buttonSurfaceStyle({
          variant,
          size,
          hovered,
          pressed,
          selected: false,
          iconOnly: false,
          block: false,
          disabled: false,
        }),
        ...style,
      }}
    >
      <ButtonContent
        gradient={hasGradientSurface(variant, false)}
        hovered={hovered}
        pressed={pressed}
        disabled={false}
      >
        {children}
      </ButtonContent>
    </a>
  );
}
