import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, control, fontSize, neutral, radii } from '@industry/tokens';
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
      style={[
        {
          flexDirection: 'row',
          borderTopLeftRadius: radii.lg,
          borderTopRightRadius: radii.lg,
          backgroundColor: color.surface,
          paddingBottom: insets.bottom,
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
                      fontSize: fontSize.h6,
                      color: active ? color.text : neutral['400'],
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
