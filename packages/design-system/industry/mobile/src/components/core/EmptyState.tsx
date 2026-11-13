import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, fontFamily, fontSize, fontWeight, neutral, radii, space } from '@industry/tokens';

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  /** Usually a primary `<Button>`. */
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function EmptyState({ icon, title, body, action, style, testID }: EmptyStateProps) {
  return (
    <View
      testID={testID}
      style={[
        {
          alignItems: 'center',
          gap: space[3],
          paddingVertical: space[12],
          paddingHorizontal: space[6],
          borderRadius: radii.lg,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: color.dividerStrong,
        },
        style,
      ]}
    >
      {icon ? <View style={{ opacity: 0.8 }}>{icon}</View> : null}
      {title ? (
        <Text
          style={{
            fontFamily: fontFamily.heading,
            fontWeight: fontWeight.heading,
            fontSize: fontSize.h4,
            textAlign: 'center',
            color: color.text,
          }}
        >
          {title}
        </Text>
      ) : null}
      {body ? (
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.h6,
            textAlign: 'center',
            color: neutral['400'],
          }}
        >
          {body}
        </Text>
      ) : null}
      {action}
    </View>
  );
}
