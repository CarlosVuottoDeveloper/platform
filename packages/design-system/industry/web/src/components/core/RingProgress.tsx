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

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function resolveRingDash(
  value: number,
  max: number,
  radius: number,
): { dasharray: string; dashoffset: number; fraction: number; now: number } {
  const circumference = 2 * Math.PI * radius;
  const safeMax = Math.max(finiteOrZero(max), 0);
  const now = Math.min(Math.max(finiteOrZero(value), 0), safeMax);
  const fraction = safeMax > 0 ? now / safeMax : 0;
  return {
    dasharray: `${circumference} ${circumference}`,
    dashoffset: circumference * (1 - fraction),
    fraction,
    now,
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
  const radius = Math.max((size - thickness) / 2, 0);
  const safeMax = finiteOrZero(max);
  const { dasharray, dashoffset, fraction, now } = resolveRingDash(value, safeMax, radius);

  return (
    <div
      data-testid={testID}
      role="progressbar"
      aria-label={accessibilityLabel}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={now}
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
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" style={{ stopColor: 'var(--gradient-primary-start)' }} />
            <stop offset="1" style={{ stopColor: 'var(--gradient-primary-end)' }} />
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
      {centerLabel ? <div style={{ position: 'relative' }}>{centerLabel}</div> : null}
    </div>
  );
}
