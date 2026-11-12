import { Pressable, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import {
  alpha,
  color,
  fontFamily,
  fontWeight,
  radii,
  semanticColor,
  shadow,
  space,
} from '@industry/tokens';
import { Icon } from './Icon';

export type ToastTone = 'accent' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  tone?: ToastTone;
  title?: ReactNode;
  onDismiss?: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ACCENT_COLOR: Record<ToastTone, string> = {
  accent: color.accent,
  success: semanticColor.success,
  warning: semanticColor.warning,
  danger: semanticColor.danger,
};

/** Stack several inside a `flexDirection: 'column'` wrapper. */
export function Toast({ tone = 'accent', title, onDismiss, children, style }: ToastProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: space[3],
          paddingVertical: space[3],
          paddingHorizontal: space[4],
          backgroundColor: color.surface2,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: color.divider,
          borderLeftWidth: 2,
          borderLeftColor: ACCENT_COLOR[tone],
        },
        shadow.md,
        style,
      ]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <Text
            style={{
              fontFamily: fontFamily.heading,
              fontWeight: fontWeight.heading,
              fontSize: 16,
              color: ACCENT_COLOR[tone],
            }}
          >
            {title}
          </Text>
        ) : null}
        {children ? (
          <Text style={{ fontSize: 13, color: alpha(ACCENT_COLOR[tone], 65) }}>{children}</Text>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dispensar"
          onPress={onDismiss}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Icon name="X" size="sm" color={color.text} />
        </Pressable>
      ) : null}
    </View>
  );
}
