import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, radii } from '@industry/tokens';
import { PillSegment } from './PillSegment';

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
          <PillSegment
            key={opt.value}
            active={checked}
            onPress={() => onValueChange?.(opt.value)}
            testID={`segment-option-${opt.value}`}
            surfaceTestID={`segment-surface-${opt.value}`}
            accessibilityRole="radio"
            accessibilityState={{ checked }}
            icon={opt.icon}
            label={opt.label}
          />
        );
      })}
    </View>
  );
}
