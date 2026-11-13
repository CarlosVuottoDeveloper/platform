import type { CSSProperties, ReactNode } from 'react';

export interface DuotoneProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Duotone({ children, style, className }: DuotoneProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
    >
      {children}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'var(--color-accent)',
          mixBlendMode: 'color',
        }}
      />
    </div>
  );
}
