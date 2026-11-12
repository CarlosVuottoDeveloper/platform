import { StyleSheet, View } from 'react-native';
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

function splitPadding(style: StyleProp<ViewStyle>): { padding: ViewStyle; layout: ViewStyle } {
  const padding: Record<string, unknown> = {};
  const layout: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(StyleSheet.flatten(style) ?? {})) {
    (key.startsWith('padding') ? padding : layout)[key] = value;
  }
  return { padding, layout };
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
  const surfaceStyle: ViewStyle = {
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: colors[0],
    experimental_backgroundImage: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`,
  };

  if (!glow) {
    return (
      <View testID={testID} style={[surfaceStyle, style]}>
        {children}
      </View>
    );
  }

  const { padding, layout } = splitPadding(style);
  return (
    <View
      testID={testID ? `${testID}-glow` : undefined}
      style={[{ borderRadius: radius, boxShadow: glowToken.accent }, layout]}
    >
      <View testID={testID} style={[surfaceStyle, { flexGrow: 1 }, padding]}>
        {children}
      </View>
    </View>
  );
}
