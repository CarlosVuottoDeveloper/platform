import { Pressable, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  accentRamp,
  alpha,
  color,
  control,
  fontFamily,
  fontSize,
  fontWeight,
  radii,
  space,
} from '@industry/tokens';

export interface ChipProps {
  children: string;
  /** Single-choice selection state (unlike a removable filter tag). */
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function resolveChipBackground(selected: boolean): string {
  return selected ? alpha(color.accent, 22) : color.surface2;
}

export function Chip({
  children,
  selected = false,
  onPress,
  disabled = false,
  style,
  testID,
}: ChipProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={[
        {
          height: control.heightSm,
          paddingHorizontal: space[3],
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          backgroundColor: resolveChipBackground(selected),
          borderWidth: 1,
          borderRadius: radii.pill,
          borderColor: selected ? color.accent : alpha(color.text, 10),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: fontFamily.body,
          fontWeight: selected ? fontWeight.heading : fontWeight.body,
          fontSize: fontSize.h6,
          color: selected ? accentRamp['300'] : alpha(color.text, 70),
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
