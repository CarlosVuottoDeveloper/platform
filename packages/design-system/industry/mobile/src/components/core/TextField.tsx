import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { BlurEvent, FocusEvent, StyleProp, TextInputProps, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import {
  accentRamp,
  alpha,
  color,
  control,
  danger,
  fontSize,
  radii,
  semanticColor,
  space,
} from '@industry/tokens';
import { Icon } from './Icon';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Adds a trailing eye/eye-off toggle that flips `secureTextEntry`. */
  secureToggle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  hint,
  error,
  multiline,
  secureToggle = false,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry ?? true);
  const resolvedSecureTextEntry = secureToggle ? hidden : secureTextEntry;
  const borderColor = error
    ? semanticColor.danger
    : focused
      ? accentRamp['400']
      : color.controlBorder;

  const inputElement = (
    <TextInput
      multiline={multiline}
      secureTextEntry={resolvedSecureTextEntry}
      onFocus={(e: FocusEvent) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e: BlurEvent) => {
        setFocused(false);
        onBlur?.(e);
      }}
      accessibilityLabel={typeof label === 'string' ? label : undefined}
      placeholderTextColor={alpha(color.text, 38)}
      selectionColor={color.accent}
      style={
        secureToggle
          ? { flex: 1, fontSize: fontSize.body, color: color.text }
          : {
              minHeight: multiline ? 104 : control.height,
              paddingHorizontal: space[3],
              paddingVertical: multiline ? space[2] : 0,
              fontSize: fontSize.body,
              color: color.text,
              backgroundColor: color.surface,
              borderWidth: 1,
              borderColor,
              borderRadius: radii.md,
              textAlignVertical: multiline ? 'top' : 'center',
            }
      }
      {...rest}
    />
  );

  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? (
        <Text style={{ fontSize: fontSize.h6, color: alpha(color.text, 70) }}>{label}</Text>
      ) : null}
      {secureToggle ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: control.height,
            paddingHorizontal: space[3],
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor,
            borderRadius: radii.md,
          }}
        >
          {inputElement}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
          >
            <Icon name={hidden ? 'Eye' : 'EyeOff'} size="sm" color={alpha(color.text, 50)} />
          </Pressable>
        </View>
      ) : (
        inputElement
      )}
      {error ? (
        <Text style={{ fontSize: 12, color: danger['300'] }}>{error}</Text>
      ) : hint ? (
        <Text style={{ fontSize: 12, color: alpha(color.text, 50) }}>{hint}</Text>
      ) : null}
    </View>
  );
}
