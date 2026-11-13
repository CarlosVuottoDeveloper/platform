import type { CSSProperties } from 'react';

export interface BarChartSeries {
  label: string;
  color: string;
}

export interface BarChartGroup {
  label: string;
  /** One value per series, in the same order as `series`. */
  values: number[];
}

export interface BarChartProps {
  series: BarChartSeries[];
  groups: BarChartGroup[];
  height?: number;
  valueFormatter?: (value: number) => string;
  style?: CSSProperties;
  testID?: string;
}

let defaultNumberFormat: Intl.NumberFormat | undefined;

function defaultValueFormatter(value: number): string {
  defaultNumberFormat ??= new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  return defaultNumberFormat.format(value);
}

function drawableValue(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : 0;
}

function heightPercent(value: number, max: number): string {
  return `${max === 0 ? 0 : Number(((value / max) * 100).toFixed(2))}%`;
}

const LABEL_STYLE: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-h6)',
  color: 'var(--color-neutral-400)',
};

/** Grouped vertical bars, one bar per series in each group. Pass `--viz-*` tokens as series colors. */
export function BarChart({
  series,
  groups,
  height = 180,
  valueFormatter = defaultValueFormatter,
  style,
  testID,
}: BarChartProps) {
  const valuesByGroup = groups.map((group) =>
    series.map((_, seriesIndex) => drawableValue(group.values[seriesIndex])),
  );
  const max = Math.max(0, ...valuesByGroup.flat());
  const hasData = groups.length > 0;

  return (
    <div data-testid={testID} style={{ display: 'grid', gap: 'var(--space-3)', ...style }}>
      <div
        role={hasData ? 'img' : undefined}
        aria-label={
          hasData
            ? groups
                .map(
                  (group, groupIndex) =>
                    `${group.label}: ${series
                      .map(
                        (item, seriesIndex) =>
                          `${item.label} ${valueFormatter(valuesByGroup[groupIndex]?.[seriesIndex] ?? 0)}`,
                      )
                      .join(', ')}`,
                )
                .join('; ')
            : undefined
        }
        style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--space-3)' }}
      >
        {groups.map((group, groupIndex) => (
          <div
            key={group.label}
            style={{ flex: 1, minWidth: 0, display: 'grid', gap: 'var(--space-1)' }}
          >
            <div
              style={{
                height,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: 'var(--space-1)',
                borderBottom: '1px solid var(--viz-grid)',
              }}
            >
              {series.map((item, seriesIndex) => (
                <div
                  key={item.label}
                  data-bar={item.label}
                  data-testid={testID ? `${testID}-bar-${groupIndex}-${seriesIndex}` : undefined}
                  style={{
                    flex: 1,
                    maxWidth: 28,
                    height: heightPercent(valuesByGroup[groupIndex]?.[seriesIndex] ?? 0, max),
                    background: item.color,
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                ...LABEL_STYLE,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {group.label}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        {series.map((item) => (
          <div
            key={item.label}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                borderRadius: 'var(--radius-pill)',
                background: item.color,
              }}
            />
            <span style={{ ...LABEL_STYLE, color: 'var(--color-text)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
