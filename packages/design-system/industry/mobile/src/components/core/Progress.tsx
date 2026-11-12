import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, fontFamily, fontSize, neutral, radii, space } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

export interface ProgressProps {
  value?: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Progress({
  value = 0,
  max = 100,
  label,
  showValue = true,
  style,
  testID,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const width = useRef(new Animated.Value(pct)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    Animated.timing(width, { toValue: pct, duration: 240, useNativeDriver: false }).start();
  }, [pct, width]);

  return (
    <View style={style}>
      {label || showValue ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: space[1],
          }}
        >
          <Text
            style={{ fontFamily: fontFamily.body, fontSize: fontSize.h6, color: neutral['400'] }}
          >
            {label}
          </Text>
          {showValue ? (
            <Text
              style={{ fontFamily: fontFamily.body, fontSize: fontSize.h6, color: neutral['400'] }}
            >
              {Math.round(pct)}%
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        testID={testID}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max, now: value }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={{
          height: space[2],
          backgroundColor: color.surface2,
          borderRadius: radii.pill,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          testID={testID ? `${testID}-fill` : undefined}
          style={{
            height: '100%',
            borderRadius: radii.pill,
            overflow: 'hidden',
            width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          }}
        >
          <GradientSurface
            testID={testID ? `${testID}-gradient` : undefined}
            variant="primary"
            radius={radii.pill}
            style={{ height: '100%', width: trackWidth }}
          />
        </Animated.View>
      </View>
    </View>
  );
}

export interface SpinnerProps {
  style?: StyleProp<ViewStyle>;
}

export function Spinner({ style }: SpinnerProps) {
  return (
    <ActivityIndicator
      animating
      size="small"
      color={color.accent}
      style={style}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
    />
  );
}
