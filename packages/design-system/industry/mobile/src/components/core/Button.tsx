import { useState } from 'react';
import { Pressable, Text } from 'react-native';
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
  fontWeight,
  space,
} from '@industry/tokens';

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
): { container: ViewStyle; text: TextStyle } {
  if (variant === 'primary') {
    return {
      container: {
        backgroundColor: pressed ? accentRamp['500'] : color.accent,
        borderColor: pressed ? accentRamp['500'] : color.accent,
      },
      text: { color: color.bg },
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
        backgroundColor: pressed ? alpha(danger['400'], 16) : 'transparent',
        borderColor: alpha(danger['400'], 45),
      },
      text: { color: danger['300'] },
    };
  }
  return {
    container: {
      backgroundColor: pressed ? alpha(color.text, 14) : 'transparent',
      borderColor: color.divider,
    },
    text: { color: color.text },
  };
}

const selectedContainerStyle: ViewStyle = {
  backgroundColor: alpha(color.accent, 16),
  borderColor: accentRamp['400'],
};

export function Button({
  variant = 'secondary',
  size = 'md',
  block,
  selected,
  iconOnly,
  disabled,
  onPressIn,
  onPressOut,
  children,
  style,
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const height = size === 'sm' ? control.heightSm : control.height;
  const { container, text } = resolveVariantStyle(variant, pressed && !disabled);

  return (
    <Pressable
      testID="button-root"
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled), selected: Boolean(selected) }}
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
          borderWidth: 1,
          borderRadius: 0,
          opacity: disabled ? 0.45 : 1,
        },
        container,
        selected ? selectedContainerStyle : null,
        style,
      ]}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            {
              fontFamily: fontFamily.heading,
              fontWeight: fontWeight.heading,
              fontSize: size === 'sm' ? 14 : 15,
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
