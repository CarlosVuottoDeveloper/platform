import { ScrollView, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, neutral, radii, space } from '@industry/tokens';
import { PillSegment } from './PillSegment';

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

function TabCount({ count }: { count: number }) {
  return (
    <Text
      style={{
        fontSize: 12,
        paddingHorizontal: space[2],
        paddingVertical: space[1],
        borderRadius: radii.pill,
        overflow: 'hidden',
        backgroundColor: color.surface2,
        color: neutral['200'],
      }}
    >
      {count}
    </Text>
  );
}

export function Tabs({ items = [], current, onSelect, style }: TabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      style={[{ flexGrow: 0 }, style]}
      contentContainerStyle={{
        flexDirection: 'row',
        backgroundColor: color.surface,
        borderRadius: radii.pill,
      }}
    >
      {items.map((item, index) => {
        const tab = resolveTab(item);
        const id = tab.id ?? (typeof tab.label === 'string' ? tab.label : String(index));
        const active = current === id;
        return (
          <PillSegment
            key={id}
            active={active}
            onPress={onSelect ? () => onSelect(id) : undefined}
            testID={`tab-${id}`}
            surfaceTestID={`tab-surface-${id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            icon={tab.icon}
            label={tab.label}
            trailing={tab.count != null ? <TabCount count={tab.count} /> : undefined}
          />
        );
      })}
    </ScrollView>
  );
}
