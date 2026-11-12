import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { accentRamp, color, fontSize, space } from '@industry/tokens';

export interface SectionLabelProps {
  children: string;
  trailing?: ReactNode;
  testID?: string;
}

export function SectionLabel({ children, trailing, testID }: SectionLabelProps) {
  return (
    <View style={{ gap: space[2] }} testID={testID}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: fontSize.h6,
            color: accentRamp['300'],
          }}
        >
          {children}
        </Text>
        {trailing}
      </View>
      <View style={{ height: 1, backgroundColor: color.divider }} />
    </View>
  );
}
