import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import {
  color,
  danger,
  fontSize,
  neutral,
  radii,
  semanticColor,
  success,
  warning,
} from '@industry/tokens';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  /** Semantic tone — hues rotated off the steel accent. */
  tone?: BadgeTone;
  /** Filled instead of outlined. Use for the one status that must shout. */
  solid?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const OUTLINE_COLOR: Record<BadgeTone, string> = {
  neutral: neutral['300'],
  accent: color.accent,
  success: success['300'],
  warning: warning['300'],
  danger: danger['300'],
};

const SOLID_BACKGROUND: Partial<Record<BadgeTone, string>> = {
  accent: color.accent,
  success: semanticColor.success,
  warning: semanticColor.warning,
  danger: semanticColor.danger,
};

/** A status pill with a leading dot marker. */
export function Badge({ tone = 'neutral', solid, children, style, testID }: BadgeProps) {
  const textColor = solid ? color.bg : OUTLINE_COLOR[tone];

  return (
    <View
      testID={testID}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderWidth: 1,
          borderRadius: radii.pill,
          borderColor: solid ? 'transparent' : OUTLINE_COLOR[tone],
          backgroundColor: solid ? SOLID_BACKGROUND[tone] : color.surface2,
        },
        style,
      ]}
    >
      <View style={{ width: 6, height: 6, borderRadius: radii.pill, backgroundColor: textColor }} />
      {typeof children === 'string' ? (
        <Text
          style={{
            fontSize: fontSize.h6,
            color: textColor,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
