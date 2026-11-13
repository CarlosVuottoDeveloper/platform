import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { color, radii, space, fontFamily } from '@industry/tokens';
import { Icon } from './Icon';

export interface AccordionItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items?: AccordionItem[];
  /** Allow more than one item open at once. Default: only one at a time. */
  multiple?: boolean;
  defaultOpenKeys?: string[];
  openKeys?: string[];
  onOpenKeysChange?: (keys: string[]) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Accordion({
  items = [],
  multiple = false,
  defaultOpenKeys = [],
  openKeys: controlledOpenKeys,
  onOpenKeysChange,
  style,
  testID,
}: AccordionProps) {
  const [uncontrolledOpenKeys, setUncontrolledOpenKeys] = useState(defaultOpenKeys);
  const openKeys = controlledOpenKeys ?? uncontrolledOpenKeys;

  function toggle(key: string) {
    const isOpen = openKeys.includes(key);
    const next = isOpen ? openKeys.filter((k) => k !== key) : multiple ? [...openKeys, key] : [key];
    if (controlledOpenKeys === undefined) setUncontrolledOpenKeys(next);
    onOpenKeysChange?.(next);
  }

  return (
    <View
      testID={testID}
      style={[
        { borderRadius: radii.md, backgroundColor: color.surface, overflow: 'hidden' },
        style,
      ]}
    >
      {items.map((item, index) => (
        <AccordionSection
          key={item.key}
          item={item}
          last={index === items.length - 1}
          open={openKeys.includes(item.key)}
          onToggle={() => toggle(item.key)}
          testID={testID ? `${testID}-${item.key}` : undefined}
        />
      ))}
    </View>
  );
}

function AccordionSection({
  item,
  last,
  open,
  onToggle,
  testID,
}: {
  item: AccordionItem;
  last: boolean;
  open: boolean;
  onToggle: () => void;
  testID?: string;
}) {
  return (
    <View style={{ borderBottomWidth: last ? 0 : 1, borderColor: color.divider }}>
      <Pressable
        testID={testID}
        disabled={item.disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled: item.disabled }}
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space[3],
          paddingVertical: space[4],
          paddingHorizontal: space[3],
          opacity: item.disabled ? 0.45 : 1,
        }}
      >
        {typeof item.title === 'string' ? (
          <Text style={{ fontFamily: fontFamily.body, flex: 1, fontSize: 15, color: color.text }}>
            {item.title}
          </Text>
        ) : (
          item.title
        )}
        <Icon
          name="ChevronDown"
          size="sm"
          color={color.text}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open ? (
        <View
          testID={testID ? `${testID}-panel` : undefined}
          style={{ paddingHorizontal: space[3], paddingBottom: space[4] }}
        >
          {typeof item.content === 'string' ? (
            <Text style={{ fontFamily: fontFamily.body, fontSize: 14, color: color.text }}>
              {item.content}
            </Text>
          ) : (
            item.content
          )}
        </View>
      ) : null}
    </View>
  );
}
