import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { alpha, color, fontFamily, fontSize, fontWeight, shadow, space } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

export interface SheetProps {
  open?: boolean;
  title?: ReactNode;
  onDismiss?: () => void;
  /** Action row pinned under the content. */
  actions?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Bottom sheet — the mobile counterpart of the dialog. */
export function Sheet({
  open = true,
  title,
  onDismiss,
  actions,
  children,
  style,
  testID,
}: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        testID={testID ? `${testID}-backdrop` : undefined}
        onPress={onDismiss}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: alpha(color.bg, 60) }}
      >
        <View testID={testID} onStartShouldSetResponder={() => true} style={shadow.lg}>
          <GradientSurface
            variant="surface"
            testID={testID ? `${testID}-surface` : undefined}
            style={[
              {
                gap: space[3],
                paddingHorizontal: space[4],
                paddingTop: space[3],
                paddingBottom: space[6] + insets.bottom,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderWidth: 1,
                borderColor: alpha(color.text, 8),
              },
              style,
            ]}
          >
            <View
              style={{
                width: 44,
                height: 3,
                backgroundColor: color.dividerStrong,
                alignSelf: 'center',
              }}
            />
            {title ? (
              <Text
                style={{
                  fontFamily: fontFamily.heading,
                  fontWeight: fontWeight.heading,
                  fontSize: fontSize.h4,
                  color: color.text,
                }}
              >
                {title}
              </Text>
            ) : null}
            {children}
            {actions}
          </GradientSurface>
        </View>
      </Pressable>
    </Modal>
  );
}
