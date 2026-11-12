import { useState } from 'react';
import { TextInput, View } from 'react-native';
import type { BlurEvent, FocusEvent, StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { accentRamp, alpha, color, control, fontSize, radii, space } from '@industry/tokens';
import { Icon } from './Icon';

export interface SearchFieldProps extends Omit<TextInputProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

export function SearchField({
  placeholder = 'Search',
  onFocus,
  onBlur,
  style,
  ...rest
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ position: 'relative', justifyContent: 'center' }, style]}>
      <TextInput
        placeholder={placeholder}
        onFocus={(e: FocusEvent) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e: BlurEvent) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={alpha(color.text, 38)}
        selectionColor={color.accent}
        style={{
          minHeight: control.height,
          paddingLeft: space[8],
          paddingRight: space[3],
          fontSize: fontSize.body,
          color: color.text,
          backgroundColor: color.surface,
          borderWidth: 1,
          borderColor: focused ? accentRamp['400'] : color.controlBorder,
          borderRadius: radii.pill,
        }}
        {...rest}
      />
      <View style={{ position: 'absolute', left: space[3], opacity: 0.5 }} pointerEvents="none">
        <Icon name="Search" size="sm" color={color.text} />
      </View>
    </View>
  );
}
