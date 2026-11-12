import { StyleSheet } from 'react-native';
import { gradient, radii } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

export const PRIMARY_ACTION_FILL = gradient.primary.colors[1];

interface PrimaryActionSurfaceProps {
  pressed: boolean;
  disabled: boolean;
  testID: string;
  glow?: boolean;
}

export function PrimaryActionSurface({
  pressed,
  disabled,
  testID,
  glow = true,
}: PrimaryActionSurfaceProps) {
  return (
    <GradientSurface
      testID={testID}
      variant="primary"
      radius={radii.pill}
      glow={glow && !disabled}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: pressed && !disabled ? 0.85 : 1 }]}
    />
  );
}
