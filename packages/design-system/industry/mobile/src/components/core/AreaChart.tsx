import { useId, useState } from 'react';
import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { accent2Ramp, fontFamily, fontSize, neutral, space, viz } from '@industry/tokens';

export interface AreaChartPoint {
  label: string;
  value: number;
}

export interface AreaChartProps {
  points: AreaChartPoint[];
  height?: number;
  valueFormatter?: (value: number) => string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const INSET = space[1];
const GRID_LINE_COUNT = 4;
const GRID_RATIOS = Array.from({ length: GRID_LINE_COUNT }, (_, i) => i / (GRID_LINE_COUNT - 1));
const AREA_TOP_OPACITY = 0.35;
const MAX_X_LABELS = 7;
const X_LABEL_ROW_HEIGHT = fontSize.h6 + space[1];

const defaultValueFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format;

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function resolveTicks(values: readonly number[]): number[] {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = low === high ? Math.max(1, Math.abs(low) * 0.1) : 0;
  const min = low - padding;
  const max = high + padding;
  return GRID_RATIOS.map((ratio) => roundToTenth(max - ratio * (max - min)));
}

function pointFraction(index: number, count: number): number {
  return count === 1 ? 0.5 : index / (count - 1);
}

export function selectLabelIndexes(count: number, max: number): number[] {
  if (count <= max) return Array.from({ length: count }, (_, i) => i);
  return Array.from({ length: max }, (_, k) => Math.round((k * (count - 1)) / (max - 1)));
}

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
  valueFormatter = defaultValueFormatter,
  style,
  testID,
}: AreaChartProps) {
  const gradientId = useId();
  const [width, setWidth] = useState(0);
  const hasPoints = points.length > 0;
  const { line, area } = buildAreaPath(points, width, height);
  const ticks = resolveTicks(points.map((p) => p.value));
  const labelSlot = width / MAX_X_LABELS;
  const textStyle = { fontFamily: fontFamily.body, fontSize: fontSize.h6, color: neutral['400'] };

  return (
    <View
      testID={testID}
      accessible={hasPoints}
      accessibilityRole={hasPoints ? 'image' : undefined}
      accessibilityLabel={
        hasPoints
          ? points.map((p) => `${p.label} ${valueFormatter(p.value)}`).join(', ')
          : undefined
      }
      style={style}
    >
      <View
        testID={testID ? `${testID}-plot` : undefined}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{ height, marginTop: fontSize.h6 }}
      >
        {GRID_RATIOS.map((ratio, i) => (
          <View
            key={ratio}
            testID={testID ? `${testID}-grid-${i}` : undefined}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: yAt(ratio, height),
              height: 1,
              backgroundColor: viz.grid,
            }}
          />
        ))}
        {hasPoints
          ? GRID_RATIOS.map((ratio, i) => (
              <Text
                key={ratio}
                style={[
                  textStyle,
                  { position: 'absolute', left: 0, bottom: height - yAt(ratio, height) },
                ]}
              >
                {valueFormatter(ticks[i] as number)}
              </Text>
            ))
          : null}
        {width > 0 && hasPoints ? (
          <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={accent2Ramp['400']} stopOpacity={AREA_TOP_OPACITY} />
                <Stop offset="1" stopColor={accent2Ramp['400']} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path
              testID={testID ? `${testID}-area` : undefined}
              d={area}
              fill={`url(#${gradientId})`}
            />
            <Path
              testID={testID ? `${testID}-line` : undefined}
              d={line}
              stroke={accent2Ramp['400']}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        ) : null}
      </View>
      {width > 0 ? (
        <View style={{ height: X_LABEL_ROW_HEIGHT, marginTop: space[2] }}>
          {selectLabelIndexes(points.length, MAX_X_LABELS).map((index) => {
            const left = Math.min(
              Math.max(pointFraction(index, points.length) * width - labelSlot / 2, 0),
              width - labelSlot,
            );
            return (
              <Text
                key={index}
                numberOfLines={1}
                style={[
                  textStyle,
                  { position: 'absolute', left, width: labelSlot, textAlign: 'center' },
                ]}
              >
                {points[index]?.label}
              </Text>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
