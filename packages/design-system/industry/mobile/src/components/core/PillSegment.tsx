import { Pressable, Text, View } from 'react-native';
import type { AccessibilityRole, AccessibilityState } from 'react-native';
import type { ReactNode } from 'react';
import { color, control, neutral, radii, space } from '@industry/tokens';
import { PrimaryActionSurface } from './PrimaryActionSurface';

const ACTIVE_PILL_MARGIN = (control.height - control.heightSm) / 2;

const ACTIVE_PILL_INSET = {
  position: 'absolute',
  top: ACTIVE_PILL_MARGIN,
  bottom: ACTIVE_PILL_MARGIN,
  left: ACTIVE_PILL_MARGIN,
  right: ACTIVE_PILL_MARGIN,
} as const;

interface PillSegmentProps {
  active: boolean;
  onPress?: () => void;
  testID: string;
  surfaceTestID: string;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
  icon?: ReactNode;
  label?: ReactNode;
  trailing?: ReactNode;
}

export function PillSegment({
  active,
  onPress,
  testID,
  surfaceTestID,
  accessibilityRole,
  accessibilityState,
  icon,
  label,
  trailing,
}: PillSegmentProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
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
          {active ? (
            <View pointerEvents="none" style={ACTIVE_PILL_INSET}>
              <PrimaryActionSurface
                testID={surfaceTestID}
                pressed={pressed}
                disabled={false}
                glow={false}
              />
            </View>
          ) : null}
          {icon}
          {typeof label === 'string' || typeof label === 'number' ? (
            <Text style={{ fontSize: 14, color: active ? color.text : neutral['400'] }}>
              {label}
            </Text>
          ) : (
            label
          )}
          {trailing}
        </>
      )}
    </Pressable>
  );
}
