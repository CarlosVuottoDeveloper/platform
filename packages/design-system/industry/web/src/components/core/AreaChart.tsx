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
const INSET = 4;
const GRID_LINE_COUNT = 4;
const GRID_RATIOS = Array.from({ length: GRID_LINE_COUNT }, (_, i) => i / (GRID_LINE_COUNT - 1));
const AREA_TOP_OPACITY = 0.35;

function yAt(ratioFromTop: number, height: number): number {
  return Number((INSET + ratioFromTop * (height - 2 * INSET)).toFixed(2));
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
  valueFormatter = String,
  style,
  testID,
}: AreaChartProps) {
  const gradientId = useId();
  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const { line, area } = buildAreaPath(points, VIEW_WIDTH, height);
  const labelStyle: CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-h6)',
    color: 'var(--color-neutral-400)',
  };

  return (
    <div
      data-testid={testID}
      role="img"
      aria-label={
        points.length > 0
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
              <stop offset="1" stopOpacity={0} style={{ stopColor: 'var(--color-accent-2-400)' }} />
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
        {points.length > 0
          ? GRID_RATIOS.map((ratio) => (
              <span
                key={ratio}
                style={{
                  ...labelStyle,
                  position: 'absolute',
                  left: 0,
                  bottom: height - yAt(ratio, height),
                }}
              >
                {valueFormatter(max - ratio * (max - min))}
              </span>
            ))
          : null}
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}
      >
        {points.map((p) => (
          <span key={p.label} style={labelStyle}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
