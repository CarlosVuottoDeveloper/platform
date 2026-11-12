import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, control, fontSize, glow, neutral, radii, space } from '@industry/tokens';

export interface SwitchProps extends Omit<PressableProps, 'style' | 'children'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  disabled,
  style,
  testID = 'switch-root',
  ...rest
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const isChecked = checked ?? internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    setInternalChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <Pressable
      {...rest}
      testID={testID}
      onPress={toggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: isChecked, disabled: Boolean(disabled) }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          minHeight: control.tap,
        },
        style,
      ]}
    >
      <View
        testID="switch-track"
        style={{
          width: 44,
          height: 24,
          borderWidth: 1,
          borderRadius: radii.pill,
          borderColor: color.controlBorder,
          backgroundColor: color.surface2,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <View
          testID="switch-thumb"
          style={{
            position: 'absolute',
            top: 3,
            left: isChecked ? 23 : 3,
            width: 16,
            height: 16,
            borderRadius: radii.pill,
            backgroundColor: isChecked ? color.accent : neutral['400'],
            boxShadow: isChecked ? glow.accent : undefined,
          }}
        />
      </View>
      {typeof label === 'string' || typeof label === 'number' ? (
        <Text style={{ fontSize: fontSize.body, color: color.text }}>{label}</Text>
      ) : (
        label
      )}
    </Pressable>
  );
}
