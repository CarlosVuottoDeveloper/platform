import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface PieChartSlice {
  label: string;
  value: number;
  color: string;
}

export type PieChartLegendPlacement = 'bottom' | 'right';
export type PieChartLegendValue = 'valueAndPercent' | 'percent';

export interface PieChartProps {
  slices: PieChartSlice[];
  size?: number;
  valueFormatter?: (value: number) => string;
  legendPlacement?: PieChartLegendPlacement;
  legendValue?: PieChartLegendValue;
  centerLabel?: ReactNode;
  style?: CSSProperties;
  testID?: string;
}

const VIEW = 200;
const CENTER = VIEW / 2;
const RADIUS = 70;
const STROKE_WIDTH = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DIMMED_OPACITY = 0.35;

let defaultNumberFormat: Intl.NumberFormat | undefined;

function defaultValueFormatter(value: number): string {
  defaultNumberFormat ??= new Intl.NumberFormat('pt-BR');
  return defaultNumberFormat.format(value);
}

function drawableValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

const sumOf = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0);

export function resolvePercents(values: readonly number[]): number[] {
  const total = sumOf(values);
  if (total === 0) return values.map(() => 0);

  const exact = values.map((value) => (value / total) * 100);
  const floors = exact.map(Math.floor);
  const byLargestRemainder = exact
    .map((share, index) => ({ index, remainder: share - Math.floor(share) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  const leftover = 100 - sumOf(floors);
  byLargestRemainder.slice(0, leftover).forEach(({ index }) => {
    floors[index] = (floors[index] ?? 0) + 1;
  });
  return floors;
}

export function resolveSliceDash(
  values: readonly number[],
  index: number,
): { dasharray: string; dashoffset: number } {
  const total = sumOf(values);
  const fraction = total === 0 ? 0 : (values[index] ?? 0) / total;
  const precedingFraction = total === 0 ? 0 : sumOf(values.slice(0, index)) / total;
  return {
    dasharray: `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`,
    dashoffset: -precedingFraction * CIRCUMFERENCE,
  };
}

/** Donut chart with a press-to-highlight legend. Pass `--viz-*` tokens as slice colors. */
export function PieChart({
  slices,
  size = 200,
  valueFormatter = defaultValueFormatter,
  legendPlacement = 'bottom',
  legendValue = 'valueAndPercent',
  centerLabel,
  style,
  testID,
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const values = slices.map((slice) => drawableValue(slice.value));
  const percents = resolvePercents(values);
  const hasData = sumOf(values) > 0;
  const sideBySide = legendPlacement === 'right';

  return (
    <div
      data-testid={testID}
      style={{
        display: 'flex',
        flexDirection: sideBySide ? 'row' : 'column',
        alignItems: sideBySide ? 'center' : 'stretch',
        gap: 'var(--space-6)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          alignSelf: 'center',
          flex: 'none',
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          width={size}
          height={size}
          role={hasData ? 'img' : undefined}
          aria-label={
            hasData
              ? slices.map((slice, index) => `${slice.label} ${percents[index]}%`).join(', ')
              : undefined
          }
        >
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {hasData ? (
              slices.map((slice, index) => {
                const { dasharray, dashoffset } = resolveSliceDash(values, index);
                const dimmed = activeIndex !== null && activeIndex !== index;
                return (
                  <circle
                    key={slice.label}
                    data-slice={slice.label}
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={dasharray}
                    strokeDashoffset={dashoffset}
                    strokeOpacity={dimmed ? DIMMED_OPACITY : 1}
                  />
                );
              })
            ) : (
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke="var(--color-divider)"
                strokeWidth={STROKE_WIDTH}
              />
            )}
          </g>
        </svg>
        {centerLabel ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {centerLabel}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'grid',
          gap: 'var(--space-2)',
          flex: sideBySide ? 1 : undefined,
          minWidth: 0,
        }}
      >
        {slices.map((slice, index) => {
          const active = activeIndex === index;
          const formatted = valueFormatter(slice.value);
          return (
            <button
              key={slice.label}
              type="button"
              aria-pressed={active}
              aria-label={`${slice.label}: ${formatted}, ${percents[index]}%`}
              onClick={() => setActiveIndex(active ? null : index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 0,
                border: 0,
                background: 'none',
                color: 'var(--color-text)',
                font: 'inherit',
                textAlign: 'left',
                cursor: 'pointer',
                opacity: activeIndex !== null && !active ? 0.5 : 1,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: 'none',
                  width: 10,
                  height: 10,
                  borderRadius: 'var(--radius-pill)',
                  background: slice.color,
                }}
              />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 'var(--text-h6)',
                  fontWeight: active ? 'var(--font-heading-weight)' : 400,
                }}
              >
                {slice.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--color-neutral-400)',
                }}
              >
                {legendValue === 'percent'
                  ? `${percents[index]}%`
                  : `${formatted} · ${percents[index]}%`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
