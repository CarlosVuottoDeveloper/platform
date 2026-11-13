import { GradientSurface } from './GradientSurface';

export const PRIMARY_ACTION_FILL = 'var(--color-accent-800)';

interface PrimaryActionSurfaceProps {
  pressed: boolean;
  hovered?: boolean;
  disabled: boolean;
  glow?: boolean;
}

function surfaceOpacity(pressed: boolean, hovered: boolean, disabled: boolean) {
  if (disabled) return 1;
  if (pressed) return 0.85;
  return hovered ? 0.92 : 1;
}

export function PrimaryActionSurface({
  pressed,
  hovered = false,
  disabled,
  glow = true,
}: PrimaryActionSurfaceProps) {
  return (
    <GradientSurface
      aria-hidden="true"
      variant="primary"
      radius="var(--radius-pill)"
      glow={glow && !disabled}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: 'none',
        opacity: surfaceOpacity(pressed, hovered, disabled),
      }}
    />
  );
}
