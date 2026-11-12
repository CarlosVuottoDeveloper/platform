import { Pressable, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, control, neutral, radii, space } from '@industry/tokens';
import { PrimaryActionSurface } from './PrimaryActionSurface';

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

const ACTIVE_PILL_MARGIN = (control.height - control.heightSm) / 2;

const ACTIVE_PILL_INSET = {
  position: 'absolute',
  top: ACTIVE_PILL_MARGIN,
  bottom: ACTIVE_PILL_MARGIN,
  left: ACTIVE_PILL_MARGIN,
  right: ACTIVE_PILL_MARGIN,
} as const;

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
              minHeight: control.height,
              paddingHorizontal: space[4],
              borderRadius: radii.pill,
            }}
          >
            {({ pressed }) => (
              <>
                {checked ? (
                  <View pointerEvents="none" style={ACTIVE_PILL_INSET}>
                    <PrimaryActionSurface
                      testID={`segment-surface-${opt.value}`}
                      pressed={pressed}
                      disabled={false}
                      glow={false}
                    />
                  </View>
                ) : null}
                {opt.icon}
                {typeof opt.label === 'string' || typeof opt.label === 'number' ? (
                  <Text style={{ fontSize: 14, color: checked ? color.text : neutral['400'] }}>
                    {opt.label}
                  </Text>
                ) : (
                  opt.label
                )}
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
