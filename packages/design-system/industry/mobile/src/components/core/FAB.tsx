import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { GestureResponderEvent, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { color, radii } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';
import { Icon, type IconName } from './Icon';

export type FABSize = 'md' | 'lg';

const BOX: Record<FABSize, number> = { md: 48, lg: 56 };

export interface FABProps extends Omit<PressableProps, 'style' | 'disabled'> {
  icon?: IconName;
  /** Required — becomes accessibilityLabel. */
  label: string;
  size?: FABSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Floating action button — anchor it with absolute positioning via `style`. */
export function FAB({
  icon = 'Plus',
  label,
  size = 'lg',
  disabled = false,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: FABProps) {
  const [pressed, setPressed] = useState(false);
  const box = BOX[size];

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={(e: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[
        {
          width: box,
          height: box,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          borderRadius: radii.pill,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <GradientSurface
        testID="fab-surface"
        variant="primary"
        radius={radii.pill}
        glow={!disabled}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: pressed && !disabled ? 0.85 : 1 }]}
      />
      <Icon name={icon} size={size === 'lg' ? 'md' : 'sm'} color={color.text} />
    </Pressable>
  );
}
