import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import {
  accentRamp,
  color,
  control,
  fontSize,
  fontWeight,
  neutral,
  radii,
  space,
  fontFamily,
} from '@industry/tokens';
import { PrimaryActionSurface } from './PrimaryActionSurface';

export interface TabBarItem {
  id?: string;
  label?: ReactNode;
  icon?: ReactNode;
}

export interface TabBarProps {
  items?: TabBarItem[];
  current?: string;
  onSelect?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

/** Bottom navigation bar. Respects the device's safe-area bottom inset. */
export function TabBar({ items = [], current, onSelect, style }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        {
          flexDirection: 'row',
          borderTopLeftRadius: radii.lg,
          borderTopRightRadius: radii.lg,
          backgroundColor: color.surface,
          paddingTop: space[2],
          paddingBottom: space[2] + insets.bottom,
        },
        style,
      ]}
    >
      {items.map((item, index) => {
        const id = item.id ?? (typeof item.label === 'string' ? item.label : String(index));
        const active = current === id;
        return (
          <Pressable
            key={id}
            testID={`tabbar-item-${id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={onSelect ? () => onSelect(id) : undefined}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: space[1],
              minHeight: control.tap,
            }}
          >
            {({ pressed }) => (
              <>
                {item.icon ? (
                  <View
                    testID={`tabbar-icon-${id}`}
                    style={{
                      width: control.tap,
                      height: control.tap,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: active ? 1 : 0.6,
                    }}
                  >
                    {active ? (
                      <PrimaryActionSurface
                        testID={`tabbar-surface-${id}`}
                        pressed={pressed}
                        disabled={false}
                      />
                    ) : null}
                    {item.icon}
                  </View>
                ) : null}
                {item.label ? (
                  <Text
                    style={{
                      fontFamily: fontFamily.body,
                      fontSize: fontSize.h6,
                      color: active ? accentRamp['300'] : neutral['400'],
                      fontWeight: active ? fontWeight.medium : undefined,
                    }}
                  >
                    {item.label}
                  </Text>
                ) : null}
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
