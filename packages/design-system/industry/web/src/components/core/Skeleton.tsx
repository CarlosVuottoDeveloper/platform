import type { CSSProperties } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface SkeletonProps {
  /** Render N text lines instead of a block; the last one is short. */
  lines?: number;
  height?: number | string;
  width?: number | string;
  style?: CSSProperties;
}

export function Skeleton({ lines = 0, height, width, style }: SkeletonProps) {
  const reducedMotion = usePrefersReducedMotion();
  const shimmer: CSSProperties = {
    backgroundImage:
      'linear-gradient(90deg, var(--color-surface-2) 0%, color-mix(in srgb, var(--color-text) 8%, var(--color-surface-2)) 40%, var(--color-surface-2) 80%)',
    borderRadius: 'var(--radius-md)',
    backgroundSize: '300% 100%',
    animation: reducedMotion ? 'none' : 'ind-shimmer 1.6s ease-in-out infinite',
  };

  if (lines > 0) {
    return (
      <div style={style}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            style={{
              ...shimmer,
              height: 12,
              width: index === lines - 1 ? '62%' : '100%',
              marginTop: index > 0 ? 'var(--space-2)' : undefined,
            }}
          />
        ))}
      </div>
    );
  }

  return <div style={{ ...shimmer, height: height ?? 120, width, ...style }} />;
}
