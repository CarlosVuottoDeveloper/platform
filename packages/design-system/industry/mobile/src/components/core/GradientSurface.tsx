import { View } from 'react-native';
import type { ViewProps } from 'react-native';
import type { ReactNode } from 'react';
import { glow as glowToken, gradient, radii } from '@industry/tokens';
import type { GradientName } from '@industry/tokens';

export interface GradientSurfaceProps extends ViewProps {
  variant?: GradientName;
  radius?: number;
  glow?: boolean;
  children?: ReactNode;
}

export function GradientSurface({
  variant = 'surface',
  radius = radii.lg,
  glow = false,
  children,
  style,
  ...viewProps
}: GradientSurfaceProps) {
  const { colors, angle } = gradient[variant];
  return (
    <View
      {...viewProps}
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
