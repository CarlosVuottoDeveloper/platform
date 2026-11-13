import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { color, radii, space } from '@industry/tokens';
import { useReduceMotion } from './useReduceMotion';

export interface SkeletonProps {
  /** Render N text lines instead of a block; the last one is short. */
  lines?: number;
  height?: number;
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Skeleton({ lines = 0, height, width, style, testID }: SkeletonProps) {
  if (lines > 0) {
    return (
      <View testID={testID} style={style}>
        {Array.from({ length: lines }).map((_, index) => (
          <ShimmerBlock
            key={index}
            testID={testID ? `${testID}-line-${index}` : undefined}
            height={12}
            width={index === lines - 1 ? '62%' : '100%'}
            style={index > 0 ? { marginTop: space[2] } : undefined}
          />
        ))}
      </View>
    );
  }

  return (
    <ShimmerBlock testID={testID} height={height ?? 120} width={width ?? '100%'} style={style} />
  );
}

function ShimmerBlock({
  height,
  width,
  style,
  testID,
}: {
  height: number;
  width: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity]);

  return (
    <Animated.View
      testID={testID}
      style={[
        {
          height,
          width,
          backgroundColor: color.surface2,
          borderRadius: radii.md,
          opacity: reduceMotion ? 1 : opacity,
        },
        style,
      ]}
    />
  );
}
