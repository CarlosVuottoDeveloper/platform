import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, control, neutral, radii, space } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

export interface SegmentOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

export interface SegmentedControlProps {
  options?: (string | SegmentOption)[];
  value?: string;
  onValueChange?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

function resolveOption(option: string | SegmentOption): SegmentOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export function SegmentedControl({
  options = [],
  value,
  onValueChange,
  style,
  testID,
  accessibilityLabel,
}: SegmentedControlProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          flexDirection: 'row',
          padding: (control.height - control.heightSm) / 2,
          backgroundColor: color.surface,
          borderRadius: radii.pill,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const opt = resolveOption(option);
        const checked = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            testID={`segment-option-${opt.value}`}
            onPress={() => onValueChange?.(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space[2],
              minHeight: control.heightSm,
              paddingHorizontal: space[4],
              borderRadius: radii.pill,
            }}
          >
            {checked ? (
              <GradientSurface
                testID={`segment-surface-${opt.value}`}
                variant="primary"
                radius={radii.pill}
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            {opt.icon}
            {typeof opt.label === 'string' || typeof opt.label === 'number' ? (
              <Text style={{ fontSize: 14, color: checked ? color.text : neutral['400'] }}>
                {opt.label}
              </Text>
            ) : (
              opt.label
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
