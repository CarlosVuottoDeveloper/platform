import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface RingProgressProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  centerLabel?: ReactNode;
  accessibilityLabel?: string;
  style?: CSSProperties;
  testID?: string;
}

function clampToRange(value: number, max: number): number {
  return max > 0 ? Math.min(Math.max(value, 0), max) : 0;
}

export function resolveRingDash(
  value: number,
  max: number,
  radius: number,
): { dasharray: string; dashoffset: number; fraction: number } {
  const circumference = 2 * Math.PI * radius;
  const fraction = max > 0 ? clampToRange(value, max) / max : 0;
  return {
    dasharray: `${circumference} ${circumference}`,
    dashoffset: circumference * (1 - fraction),
    fraction,
  };
}

export function RingProgress({
  value,
  max = 100,
  size = 120,
  thickness = 14,
  centerLabel,
  accessibilityLabel,
  style,
  testID,
}: RingProgressProps) {
  const gradientId = useId();
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const { dasharray, dashoffset, fraction } = resolveRingDash(value, max, radius);

  return (
    <div
      data-testid={testID}
      role="progressbar"
      aria-label={accessibilityLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clampToRange(value, max)}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" style={{ stopColor: 'var(--color-accent-600)' }} />
            <stop offset="1" style={{ stopColor: 'var(--color-accent-800)' }} />
          </linearGradient>
        </defs>
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            data-testid={testID ? `${testID}-track` : undefined}
            cx={center}
            cy={center}
            r={radius}
            stroke="var(--color-surface-2)"
            strokeWidth={thickness}
            fill="none"
          />
          {fraction > 0 ? (
            <circle
              data-testid={testID ? `${testID}-arc` : undefined}
              cx={center}
              cy={center}
              r={radius}
              stroke={`url(#${gradientId})`}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              fill="none"
            />
          ) : null}
        </g>
      </svg>
      {centerLabel}
    </div>
  );
}
