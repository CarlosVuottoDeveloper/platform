import { Pressable } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { alpha, color, control, danger, radii } from '@industry/tokens';
import { PRIMARY_ACTION_FILL, PrimaryActionSurface } from './PrimaryActionSurface';
import { Icon, type IconName } from './Icon';

export type IconButtonVariant = 'ghost' | 'solid' | 'danger';
export type IconButtonSize = 'sm' | 'md';

const BOX: Record<IconButtonSize, number> = { sm: control.heightSm, md: control.height };

export function resolveIconButtonBackground(variant: IconButtonVariant, pressed: boolean): string {
  if (variant === 'solid') return PRIMARY_ACTION_FILL;
  if (variant === 'danger') return alpha(danger['400'], pressed ? 28 : 16);
  return pressed ? color.surface : color.surface2;
}

export function resolveIconButtonIconColor(variant: IconButtonVariant): string {
  return variant === 'danger' ? danger['300'] : color.text;
}

export interface IconButtonProps extends Omit<PressableProps, 'style' | 'disabled'> {
  /** Lucide icon name (PascalCase). */
  icon: IconName;
  /** Required — becomes accessibilityLabel. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  style,
  ...rest
}: IconButtonProps) {
  const box = BOX[size];

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          width: box,
          height: box,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderRadius: radii.pill,
          borderColor: variant === 'ghost' ? alpha(color.text, 10) : undefined,
          backgroundColor: resolveIconButtonBackground(variant, pressed && !disabled),
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {({ pressed }) => (
        <>
          {variant === 'solid' ? (
            <PrimaryActionSurface
              testID="icon-button-surface"
              pressed={pressed}
              disabled={disabled}
            />
          ) : null}
          <Icon
            name={icon}
            size={size === 'sm' ? 'sm' : 'md'}
            color={resolveIconButtonIconColor(variant)}
          />
        </>
      )}
    </Pressable>
  );
}
