import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTheme } from '@industry/mobile';
import { accentRamp, fontFamily, fontSize, space } from '@industry/tokens';

export interface SectionLabelProps {
  children: string;
  trailing?: ReactNode;
  testID?: string;
}

export function SectionLabel({ children, trailing, testID }: SectionLabelProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space[2] }} testID={testID}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.h6,
            color: accentRamp['300'],
          }}
        >
          {children}
        </Text>
        {trailing}
      </View>
      <View style={{ height: 1, backgroundColor: colors.divider }} />
    </View>
  );
}
