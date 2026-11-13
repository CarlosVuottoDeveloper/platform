import { View } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@industry/mobile';
import { radii, space } from '@industry/tokens';

export interface BottomBarProps {
  children: ReactNode;
  testID?: string;
}

export function BottomBar({ children, testID }: BottomBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        gap: space[3],
        borderTopLeftRadius: radii.lg,
        borderTopRightRadius: radii.lg,
        backgroundColor: colors.surface,
        paddingTop: space[3],
        paddingHorizontal: space[6],
        paddingBottom: 20 + insets.bottom,
      }}
    >
      {children}
    </View>
  );
}
