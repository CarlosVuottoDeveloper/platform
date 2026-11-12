import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { glow as glowToken, gradient, radii } from '@industry/tokens';
import type { GradientName } from '@industry/tokens';

export interface GradientSurfaceProps {
  variant?: GradientName;
  radius?: number;
  glow?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function GradientSurface({
  variant = 'surface',
  radius = radii.lg,
  glow = false,
  children,
  style,
  testID,
}: GradientSurfaceProps) {
  const { colors, angle } = gradient[variant];
  return (
    <View
      testID={testID}
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: colors[0],
          experimental_backgroundImage: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`,
          boxShadow: glow ? glowToken.accent : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
