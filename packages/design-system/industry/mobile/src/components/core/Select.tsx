import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { alpha, color, control, danger, semanticColor, space } from '@industry/tokens';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Plain strings or {value,label} pairs. */
  options?: (string | SelectOption)[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function resolveOption(option: string | SelectOption): SelectOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export function Select({
  label,
  hint,
  error,
  options = [],
  value,
  onValueChange,
  placeholder = 'Selecionar',
  disabled = false,
  style,
  testID,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const normalized = options.map(resolveOption);
  const selected = normalized.find((o) => o.value === value);
  const borderColor = error ? semanticColor.danger : color.divider;
  const close = () => setOpen(false);

  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? <Text style={{ fontSize: 13, color: alpha(color.text, 70) }}>{label}</Text> : null}
      <Pressable
        testID={testID}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={typeof label === 'string' ? label : (selected?.label ?? placeholder)}
        accessibilityState={{ disabled }}
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: control.height,
          paddingHorizontal: space[3],
          backgroundColor: color.surface,
          borderWidth: 1,
          borderColor,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <Text
          style={{ flex: 1, fontSize: 15, color: selected ? color.text : alpha(color.text, 50) }}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Icon name="ChevronDown" size="sm" color={alpha(color.text, 70)} />
      </Pressable>
      {error ? (
        <Text style={{ fontSize: 12, color: danger['300'] }}>{error}</Text>
      ) : hint ? (
        <Text style={{ fontSize: 12, color: alpha(color.text, 50) }}>{hint}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable
          testID={testID ? `${testID}-backdrop` : undefined}
          onPress={close}
          style={{ flex: 1, backgroundColor: alpha(color.bg, 70), justifyContent: 'flex-end' }}
        >
          <View
            testID={testID ? `${testID}-panel` : undefined}
            style={{
              backgroundColor: color.surface,
              borderTopWidth: 1,
              borderColor: color.divider,
              maxHeight: '60%',
              paddingTop: space[2],
              paddingBottom: space[2] + insets.bottom,
            }}
          >
            <FlatList
              data={normalized}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const on = item.value === value;
                return (
                  <Pressable
                    testID={`select-option-${item.value}`}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      onValueChange?.(item.value);
                      setOpen(false);
                    }}
                    style={{
                      minHeight: control.tap,
                      justifyContent: 'center',
                      paddingHorizontal: space[4],
                      backgroundColor: on ? alpha(color.accent, 16) : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 15, color: on ? color.accent : color.text }}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
