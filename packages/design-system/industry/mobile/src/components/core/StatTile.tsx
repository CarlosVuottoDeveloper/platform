import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import {
  accentRamp,
  color,
  control,
  fontFamily,
  fontSize,
  fontWeight,
  neutral,
  radii,
  space,
} from '@industry/tokens';

export interface StatTileProps {
  icon?: ReactNode;
  value: ReactNode;
  label: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function StatTile({ icon, value, label, style, testID }: StatTileProps) {
  return (
    <View
      testID={testID}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: space[3] }, style]}
    >
      {icon ? (
        <View
          testID={testID ? `${testID}-icon` : undefined}
          style={{
            width: control.heightSm,
            height: control.heightSm,
            borderRadius: radii.pill,
            backgroundColor: accentRamp['800'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: fontFamily.heading,
            fontWeight: fontWeight.heading,
            fontSize: fontSize.h4,
            color: color.text,
          }}
        >
          {value}
        </Text>
        <Text style={{ fontFamily: fontFamily.body, fontSize: fontSize.h6, color: neutral['400'] }}>
          {label}
        </Text>
      </View>
    </View>
  );
}
