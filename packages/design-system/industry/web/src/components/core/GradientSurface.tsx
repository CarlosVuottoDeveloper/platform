import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type GradientName = 'primary' | 'surface' | 'backdrop';

export interface GradientSurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  variant?: GradientName;
  radius?: number | string;
  glow?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export function GradientSurface({
  variant = 'surface',
  radius = 'var(--radius-lg)',
  glow = false,
  children,
  style,
  ...rest
}: GradientSurfaceProps) {
  return (
    <div
      {...rest}
      style={{
        borderRadius: radius,
        background: `var(--gradient-${variant})`,
        boxShadow: glow ? 'var(--glow-accent)' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
