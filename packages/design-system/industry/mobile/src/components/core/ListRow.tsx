import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { GestureResponderEvent, PressableProps, StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { alpha, color, space, fontFamily, fontWeight } from '@industry/tokens';

export interface ListRowProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Leading slot — icon or avatar. */
  lead?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  /** Trailing slot — badge, chevron, switch. */
  trail?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** The list unit — 64px tall, one tap target. */
export function ListRow({
  lead,
  title,
  meta,
  trail,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: ListRowProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      onPressIn={(e: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          minHeight: 64,
          paddingHorizontal: space[4],
          paddingVertical: space[3],
          borderBottomWidth: 1,
          borderBottomColor: color.divider,
          backgroundColor: pressed ? alpha(color.text, 5) : 'transparent',
        },
        style,
      ]}
      {...rest}
    >
      {lead ? (
        <View style={{ width: 36, alignItems: 'center', justifyContent: 'center' }}>{lead}</View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fontFamily.body,
            fontSize: 15,
            fontWeight: fontWeight.medium,
            color: color.text,
          }}
        >
          {title}
        </Text>
        {meta ? (
          <Text style={{ fontFamily: fontFamily.body, fontSize: 12, color: alpha(color.text, 50) }}>
            {meta}
          </Text>
        ) : null}
      </View>
      {trail ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>{trail}</View>
      ) : null}
    </Pressable>
  );
}
