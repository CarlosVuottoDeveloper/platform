import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';
import {
  color,
  accentRamp,
  danger,
  alpha,
  control,
  fontFamily,
  fontSize,
  fontWeight,
  radii,
  space,
} from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  selected?: boolean;
  iconOnly?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function resolveVariantStyle(
  variant: ButtonVariant,
  pressed: boolean,
  selected: boolean,
): { container: ViewStyle; text: TextStyle } {
  if (selected) {
    return {
      container: {
        backgroundColor: alpha(color.accent, pressed ? 28 : 16),
        borderColor: accentRamp['400'],
      },
      text: { color: color.text },
    };
  }
  if (variant === 'primary') {
    return {
      container: { backgroundColor: 'transparent', borderColor: 'transparent' },
      text: { color: color.text },
    };
  }
  if (variant === 'ghost') {
    return {
      container: {
        backgroundColor: pressed ? alpha(color.accent, 22) : 'transparent',
        borderColor: 'transparent',
      },
      text: { color: accentRamp['300'] },
    };
  }
  if (variant === 'danger') {
    return {
      container: {
        backgroundColor: alpha(danger['400'], pressed ? 28 : 16),
        borderColor: 'transparent',
      },
      text: { color: danger['300'] },
    };
  }
  return {
    container: {
      backgroundColor: pressed ? color.surface : color.surface2,
      borderColor: alpha(color.text, 10),
    },
    text: { color: color.text },
  };
}

export function Button({
  variant = 'secondary',
  size = 'md',
  block,
  selected,
  iconOnly,
  disabled,
  accessibilityState,
  onPressIn,
  onPressOut,
  children,
  style,
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const height = size === 'sm' ? control.heightSm : control.height;
  const isPressed = pressed && !disabled;
  const { container, text } = resolveVariantStyle(variant, isPressed, Boolean(selected));
  const hasGradient = variant === 'primary' && !selected;

  return (
    <Pressable
      testID="button-root"
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled: Boolean(disabled),
        selected: Boolean(selected),
      }}
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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space[2],
          minHeight: height,
          width: iconOnly ? height : block ? '100%' : undefined,
          paddingHorizontal: iconOnly ? 0 : size === 'sm' ? space[3] : space[4],
          borderWidth: hasGradient ? 0 : 1,
          borderRadius: radii.pill,
          opacity: disabled ? 0.45 : 1,
        },
        container,
        style,
      ]}
      {...rest}
    >
      {hasGradient ? (
        <GradientSurface
          testID="button-surface"
          variant="primary"
          radius={radii.pill}
          glow={!disabled}
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: isPressed ? 0.85 : 1 }]}
        />
      ) : null}
      {typeof children === 'string' ? (
        <Text
          numberOfLines={1}
          style={[
            {
              fontFamily: fontFamily.heading,
              fontWeight: fontWeight.heading,
              fontSize: size === 'sm' ? fontSize.h6 : fontSize.body,
            },
            text,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
