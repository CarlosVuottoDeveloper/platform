import { Pressable, Text } from 'react-native';
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import {
  color,
  accentRamp,
  danger,
  neutral,
  alpha,
  control,
  fontFamily,
  fontSize,
  fontWeight,
  radii,
  space,
} from '@industry/tokens';
import { PRIMARY_ACTION_FILL, PrimaryActionSurface } from './PrimaryActionSurface';

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
      container: { backgroundColor: PRIMARY_ACTION_FILL, borderColor: 'transparent' },
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
      backgroundColor: pressed ? neutral['800'] : color.surface2,
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
  children,
  style,
  ...rest
}: ButtonProps) {
  const height = size === 'sm' ? control.heightSm : control.height;
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
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space[2],
          minHeight: height,
          width: iconOnly ? height : block ? '100%' : undefined,
          paddingHorizontal: iconOnly
            ? 0
            : (size === 'sm' ? space[3] : space[4]) + (hasGradient ? 1 : 0),
          borderWidth: hasGradient ? 0 : 1,
          borderRadius: radii.pill,
          opacity: disabled ? 0.45 : 1,
        },
        resolveVariantStyle(variant, pressed && !disabled, Boolean(selected)).container,
        style,
      ]}
      {...rest}
    >
      {({ pressed }) => {
        const { text } = resolveVariantStyle(variant, pressed && !disabled, Boolean(selected));
        return (
          <>
            {hasGradient ? (
              <PrimaryActionSurface
                testID="button-surface"
                pressed={pressed}
                disabled={Boolean(disabled)}
              />
            ) : null}
            {typeof children === 'string' ? (
              <Text
                numberOfLines={2}
                style={[
                  {
                    fontFamily: fontFamily.heading,
                    fontWeight: fontWeight.heading,
                    fontSize: size === 'sm' ? fontSize.h6 : fontSize.body,
                    textAlign: 'center',
                  },
                  text,
                ]}
              >
                {children}
              </Text>
            ) : (
              children
            )}
          </>
        );
      }}
    </Pressable>
  );
}
