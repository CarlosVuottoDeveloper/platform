import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, fontFamily, fontSize, fontWeight, space } from '@industry/tokens';
import { IconButton } from './IconButton';
import type { IconName } from './Icon';

export interface AppBarAction {
  icon: IconName;
  onPress: () => void;
  /** Required — becomes accessibilityLabel. */
  label: string;
  testID?: string;
}

export interface AppBarProps {
  title: string;
  onBackPress?: () => void;
  /** For a trigger that needs more than a plain icon button, e.g. a `Menu`-anchored filter. Renders between the title and `actions`. */
  trailing?: ReactNode;
  actions?: AppBarAction[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Top navigation bar — title with an optional back button and trailing icon actions. */
export function AppBar({ title, onBackPress, trailing, actions = [], style, testID }: AppBarProps) {
  return (
    <View
      testID={testID}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          height: 56,
          paddingHorizontal: space[3],
          backgroundColor: 'transparent',
        },
        style,
      ]}
    >
      {onBackPress ? (
        <IconButton
          icon="ArrowLeft"
          label="Voltar"
          onPress={onBackPress}
          testID={testID ? `${testID}-back` : undefined}
        />
      ) : null}
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: fontFamily.heading,
          fontWeight: fontWeight.heading,
          fontSize: fontSize.h4,
          color: color.text,
        }}
      >
        {title}
      </Text>
      {trailing}
      {actions.map((action) => (
        <IconButton
          key={action.label}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
          testID={action.testID}
        />
      ))}
    </View>
  );
}
