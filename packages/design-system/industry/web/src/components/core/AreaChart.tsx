import { useId } from 'react';
import type { CSSProperties } from 'react';

export interface AreaChartPoint {
  label: string;
  value: number;
}

export interface AreaChartProps {
  points: AreaChartPoint[];
  height?: number;
  valueFormatter?: (value: number) => string;
  style?: CSSProperties;
  testID?: string;
}

const VIEW_WIDTH = 100;
const PLOT_INSET_PX = 4;
const GRID_LINE_COUNT = 4;
const GRID_RATIOS = Array.from({ length: GRID_LINE_COUNT }, (_, i) => i / (GRID_LINE_COUNT - 1));
const AREA_TOP_OPACITY = 0.35;
const MAX_X_LABELS = 7;
const LABEL_SLOT_PERCENT = 100 / MAX_X_LABELS;

const defaultValueFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format;

function resolveTicks(values: readonly number[]): number[] {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = low === high ? Math.max(1, Math.abs(low) * 0.1) : 0;
  const min = low - padding;
  const max = high + padding;
  return GRID_RATIOS.map((ratio) => max - ratio * (max - min));
}

function pointFraction(index: number, count: number): number {
  return count === 1 ? 0.5 : index / (count - 1);
}

export function selectLabelIndexes(count: number, max: number): number[] {
  if (count <= max) return Array.from({ length: count }, (_, i) => i);
  return Array.from({ length: max }, (_, k) => Math.round((k * (count - 1)) / (max - 1)));
}

function yAt(ratioFromTop: number, height: number): number {
  return Number((PLOT_INSET_PX + ratioFromTop * (height - 2 * PLOT_INSET_PX)).toFixed(2));
}

export function buildAreaPath(
  points: readonly { value: number }[],
  width: number,
  height: number,
): { line: string; area: string } {
  if (points.length === 0) return { line: '', area: '' };

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const range = Math.max(...values) - min;
  const ratioFromTop = (value: number) => (range === 0 ? 0.5 : 1 - (value - min) / range);

  const coordinates =
    points.length === 1
      ? [
          { x: 0, y: yAt(0.5, height) },
          { x: width, y: yAt(0.5, height) },
        ]
      : points.map((p, i) => ({
          x: Number(((i * width) / (points.length - 1)).toFixed(2)),
          y: yAt(ratioFromTop(p.value), height),
        }));

  const line = coordinates.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x} ${c.y}`).join('');
  return { line, area: `${line}L${width} ${height}L0 ${height}Z` };
}

export function AreaChart({
  points,
  height = 180,
  valueFormatter = defaultValueFormatter,
  style,
  testID,
}: AreaChartProps) {
  const gradientId = useId();
  const hasPoints = points.length > 0;
  const ticks = resolveTicks(points.map((p) => p.value));
  const { line, area } = buildAreaPath(points, VIEW_WIDTH, height);
  const labelStyle: CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-h6)',
    color: 'var(--color-neutral-400)',
  };

  return (
    <div
      data-testid={testID}
      role={hasPoints ? 'img' : undefined}
      aria-label={
        hasPoints
          ? points.map((p) => `${p.label} ${valueFormatter(p.value)}`).join(', ')
          : undefined
      }
      style={style}
    >
      <div
        data-testid={testID ? `${testID}-plot` : undefined}
        style={{ position: 'relative', height, marginTop: 'var(--text-h6)' }}
      >
        {GRID_RATIOS.map((ratio, i) => (
          <div
            key={ratio}
            data-testid={testID ? `${testID}-grid-${i}` : undefined}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: yAt(ratio, height),
              height: 1,
              background: 'var(--viz-grid)',
            }}
          />
        ))}
        {hasPoints ? (
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0"
                  stopOpacity={AREA_TOP_OPACITY}
                  style={{ stopColor: 'var(--color-accent-2-400)' }}
                />
                <stop
                  offset="1"
                  stopOpacity={0}
                  style={{ stopColor: 'var(--color-accent-2-400)' }}
                />
              </linearGradient>
            </defs>
            <path
              data-testid={testID ? `${testID}-area` : undefined}
              d={area}
              fill={`url(#${gradientId})`}
            />
            <path
              data-testid={testID ? `${testID}-line` : undefined}
              d={line}
              stroke="var(--color-accent-2-400)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
          </svg>
        ) : null}
        {hasPoints
          ? GRID_RATIOS.map((ratio, i) => (
              <span
                key={ratio}
                style={{
                  ...labelStyle,
                  position: 'absolute',
                  left: 0,
                  bottom: height - yAt(ratio, height),
                }}
              >
                {valueFormatter(ticks[i] as number)}
              </span>
            ))
          : null}
      </div>
      <div
        style={{
          position: 'relative',
          height: 'calc(var(--text-h6) + var(--space-1))',
          marginTop: 'var(--space-2)',
        }}
      >
        {selectLabelIndexes(points.length, MAX_X_LABELS).map((index) => {
          const left = Math.min(
            Math.max(pointFraction(index, points.length) * 100 - LABEL_SLOT_PERCENT / 2, 0),
            100 - LABEL_SLOT_PERCENT,
          );
          return (
            <span
              key={index}
              style={{
                ...labelStyle,
                position: 'absolute',
                left: `${left}%`,
                width: `${LABEL_SLOT_PERCENT}%`,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {points[index]?.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
