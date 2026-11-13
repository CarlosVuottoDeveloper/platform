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
  const [width, setWidth] = useState(0);
  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const { line, area } = buildAreaPath(points, width, height);
  const textStyle = { fontFamily: fontFamily.body, fontSize: fontSize.h6, color: neutral['400'] };

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        points.length > 0
          ? points.map((p) => `${p.label} ${valueFormatter(p.value)}`).join(', ')
          : undefined
      }
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={style}
    >
      <View
        testID={testID ? `${testID}-plot` : undefined}
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
        {points.length > 0
          ? GRID_RATIOS.map((ratio) => (
              <Text
                key={ratio}
                style={[
                  textStyle,
                  { position: 'absolute', left: 0, bottom: height - yAt(ratio, height) },
                ]}
              >
                {valueFormatter(max - ratio * (max - min))}
              </Text>
            ))
          : null}
        {width > 0 && points.length > 0 ? (
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space[2] }}>
        {points.map((p) => (
          <Text key={p.label} style={textStyle}>
            {p.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
