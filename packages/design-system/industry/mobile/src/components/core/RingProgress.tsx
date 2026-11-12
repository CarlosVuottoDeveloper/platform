import { useId } from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Stop } from 'react-native-svg';
import { color, gradient } from '@industry/tokens';

export interface RingProgressProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  centerLabel?: ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
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
  const [from, to] = gradient.primary.colors;

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max, now: clampToRange(value, max) }}
      style={[{ width: size, height: size }, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <G rotation={-90} originX={center} originY={center}>
          <Circle
            testID={testID ? `${testID}-track` : undefined}
            cx={center}
            cy={center}
            r={radius}
            stroke={color.surface2}
            strokeWidth={thickness}
            fill="none"
          />
          {fraction > 0 ? (
            <Circle
              testID={testID ? `${testID}-arc` : undefined}
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
        </G>
      </Svg>
      {centerLabel ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {centerLabel}
        </View>
      ) : null}
    </View>
  );
}
