import { forwardRef } from 'react';
import {
  Pressable,
  Text,
  type View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';
import {
  alpha,
  color,
  danger,
  fontSize,
  radii,
  semanticColor,
  space,
  fontFamily,
  fontWeight,
} from '@industry/tokens';
import { Icon } from './Icon';

export interface FileDropProps {
  label?: string;
  hint?: ReactNode;
  error?: ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function resolveDropzoneBackground(pressed: boolean): string {
  return pressed ? color.surface2 : color.surface;
}

/** Dashed drop zone for a file/photo picker — the only dashed border in the system. Fires `onPress`; wiring an actual native picker (e.g. expo-document-picker) is left to the consumer. */
export const FileDrop = forwardRef<View, FileDropProps>(function FileDrop(
  {
    label = 'Toque para escolher um arquivo',
    hint = 'PNG, JPG ou PDF até 10 MB',
    error,
    onPress,
    disabled = false,
    style,
    testID,
  },
  ref,
) {
  const borderColor = error ? semanticColor.danger : color.dividerStrong;

  return (
    <Pressable
      ref={ref}
      testID={testID}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          justifyContent: 'center',
          gap: space[2],
          paddingVertical: space[8],
          paddingHorizontal: space[4],
          backgroundColor: resolveDropzoneBackground(pressed),
          borderRadius: radii.lg,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor,
          opacity: disabled ? 0.45 : 1,
        },
        style as ViewStyle,
      ]}
    >
      <Icon name="Upload" size="lg" color={color.text} />
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.body,
          fontWeight: fontWeight.medium,
          color: color.text,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
      {hint ? (
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: 12,
            color: alpha(color.text, 50),
            textAlign: 'center',
          }}
        >
          {hint}
        </Text>
      ) : null}
      {error ? (
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: 12,
            color: danger['300'],
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      ) : null}
    </Pressable>
  );
});
