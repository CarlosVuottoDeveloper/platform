import { Pressable, ScrollView, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { alpha, color, control, fontFamily, fontWeight, neutral, space } from '@industry/tokens';

export interface TabItem {
  id?: string;
  label?: ReactNode;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps {
  items?: (string | TabItem)[];
  current?: string;
  onSelect?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

function resolveTab(item: string | TabItem): TabItem {
  return typeof item === 'string' ? { id: item, label: item } : item;
}

export function Tabs({ items = [], current, onSelect, style }: TabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      style={[{ borderBottomWidth: 1, borderBottomColor: color.divider }, style]}
      contentContainerStyle={{ flexDirection: 'row', gap: space[4] }}
    >
      {items.map((item, index) => {
        const tab = resolveTab(item);
        const id = tab.id ?? (typeof tab.label === 'string' ? tab.label : String(index));
        return (
          <TabButton
            key={id}
            id={id}
            tab={tab}
            active={current === id}
            onSelect={onSelect ? () => onSelect(id) : undefined}
          />
        );
      })}
    </ScrollView>
  );
}

function TabButton({
  id,
  tab,
  active,
  onSelect,
}: {
  id: string;
  tab: TabItem;
  active: boolean;
  onSelect?: () => void;
}) {
  return (
    <Pressable
      testID={`tab-${id}`}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onSelect}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[2],
        minHeight: control.height,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: active ? color.accent : 'transparent',
      }}
    >
      {tab.icon}
      {tab.label ? (
        <Text
          style={{
            fontFamily: fontFamily.heading,
            fontWeight: fontWeight.heading,
            fontSize: 16,
            color: active ? color.text : alpha(color.text, 60),
          }}
        >
          {tab.label}
        </Text>
      ) : null}
      {tab.count != null ? (
        <Text
          style={{
            fontSize: 12,
            paddingHorizontal: 10,
            paddingVertical: 3,
            backgroundColor: neutral['900'],
            color: neutral['200'],
          }}
        >
          {tab.count}
        </Text>
      ) : null}
    </Pressable>
  );
}
