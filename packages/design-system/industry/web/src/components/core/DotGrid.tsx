import type { CSSProperties } from 'react';

export type DotLevel = 0 | 1 | 2 | 3;

export interface DotGridProps {
  /** Intensity of each dot, from 0 (empty) to 1 (full). */
  values: number[];
  columns: number;
  /** Labels shown at both ends of a legend under the grid. */
  legend?: { low: string; high: string };
  /** Accessible name. Without it the grid is decorative. */
  label?: string;
  style?: CSSProperties;
  testID?: string;
}

const LEVEL_FILLS: Record<DotLevel, string> = {
  0: 'var(--color-surface-2)',
  1: 'var(--color-accent-800)',
  2: 'var(--color-accent-600)',
  3: 'var(--color-accent-400)',
};

const LEVELS: DotLevel[] = [0, 1, 2, 3];

export function dotLevel(value: number): DotLevel {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value < 0.34) return 1;
  return value < 0.67 ? 2 : 3;
}

function Dot({ level, size }: { level: DotLevel; size?: number }) {
  return (
    <span
      data-level={level}
      style={{
        display: 'block',
        width: size ?? '100%',
        aspectRatio: '1',
        borderRadius: 'var(--radius-pill)',
        background: LEVEL_FILLS[level],
      }}
    />
  );
}

/** Grid of round cells shaded by intensity — a calendar-style heatmap. */
export function DotGrid({ values, columns, legend, label, style, testID }: DotGridProps) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', ...style }}>
      <div
        data-testid={testID ? `${testID}-dots` : undefined}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 'var(--space-2)',
        }}
      >
        {values.map((value, index) => (
          <Dot key={index} level={dotLevel(value)} />
        ))}
      </div>
      {legend ? (
        <div
          data-testid={testID ? `${testID}-legend` : undefined}
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-h6)',
            color: 'var(--color-neutral-300)',
          }}
        >
          <span>{legend.low}</span>
          {LEVELS.map((level) => (
            <Dot key={level} level={level} size={10} />
          ))}
          <span>{legend.high}</span>
        </div>
      ) : null}
    </div>
  );
}
