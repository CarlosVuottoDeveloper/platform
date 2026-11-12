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
        inset: 0,
        // zIndex -1 only stays above the parent's own background when the parent sets isolation: isolate
        zIndex: -1,
        pointerEvents: 'none',
        opacity: surfaceOpacity(pressed, hovered, disabled),
      }}
    />
  );
}
