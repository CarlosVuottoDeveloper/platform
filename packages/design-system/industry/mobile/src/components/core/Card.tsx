import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { accentRamp, alpha, color, fontFamily, fontWeight, shadow, space } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

export type CardElevation = 'sm' | 'md' | 'lg';

export interface CardProps {
  kicker?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  meta?: ReactNode;
  elevation?: CardElevation;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({ kicker, title, body, meta, elevation, children, style, testID }: CardProps) {
  return (
    <GradientSurface
      variant="surface"
      testID={testID}
      style={[
        {
          gap: space[2],
          padding: space[4],
          borderWidth: 1,
          borderColor: color.divider,
        },
        elevation ? shadow[elevation] : null,
        style,
      ]}
    >
      {kicker ? (
        <Text style={{ fontFamily: fontFamily.body, fontSize: 11, color: accentRamp['300'] }}>
          {kicker}
        </Text>
      ) : null}
      {title ? (
        <Text
          style={{
            fontFamily: fontFamily.heading,
            fontWeight: fontWeight.heading,
            fontSize: 19,
            lineHeight: 23,
            color: color.text,
          }}
        >
          {title}
        </Text>
      ) : null}
      {body ? (
        <Text style={{ fontFamily: fontFamily.body, fontSize: 14, color: alpha(color.text, 80) }}>
          {body}
        </Text>
      ) : null}
      {children}
      {meta ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          <Text style={{ fontFamily: fontFamily.body, fontSize: 12, color: alpha(color.text, 50) }}>
            {meta}
          </Text>
        </View>
      ) : null}
    </GradientSurface>
  );
}
