import { View } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@industry/mobile';
import { space } from '@industry/tokens';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';

export interface BottomBarProps {
  children: ReactNode;
  testID?: string;
}

/** Fixed bottom action bar — hairline top border, safe-area-aware padding. */
export function BottomBar({ children, testID }: BottomBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();

  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        gap: space[3],
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        backgroundColor: colors.bg,
        paddingTop: space[3],
        paddingHorizontal: space[6],
        paddingBottom: keyboardVisible ? space[3] : 20 + insets.bottom,
      }}
    >
      {children}
    </View>
  );
}
