import { gradient, radii } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

export const PRIMARY_ACTION_FILL = gradient.primary.colors[1];

const BORDER_BLEED = { position: 'absolute', top: -1, right: -1, bottom: -1, left: -1 } as const;

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
      style={[BORDER_BLEED, { opacity: pressed && !disabled ? 0.85 : 1 }]}
    />
  );
}
