import { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { accentRamp, alpha, color, shadow, space } from '@industry/tokens';
import { Icon } from './Icon';

export interface MenuItem {
  key?: string;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export interface MenuProps {
  /** Usually a `<Button>` or `<IconButton>` — receives the press that opens the menu. */
  trigger: ReactNode;
  /** Small uppercase label above the items, e.g. a group heading like "Período". */
  header?: string;
  items?: MenuItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  testID?: string;
}

export function resolveMenuPosition(
  anchor: { x: number; y: number; width: number; height: number },
  windowWidth: number,
): { top: number; right: number } {
  return {
    top: anchor.y + anchor.height + space[1],
    right: Math.max(windowWidth - (anchor.x + anchor.width), space[3]),
  };
}

/** Anchored dropdown list of actions, positioned below and right-aligned to the trigger. */
export function Menu({
  trigger,
  header,
  items = [],
  open: controlledOpen,
  onOpenChange,
  testID,
}: MenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const anchorRef = useRef<View>(null);
  const [position, setPosition] = useState<{ top: number; right: number }>({
    top: 0,
    right: space[3],
  });

  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!open) return;
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      const { width: windowWidth } = Dimensions.get('window');
      setPosition(resolveMenuPosition({ x, y, width, height }, windowWidth));
    });
  }, [open]);

  return (
    <>
      <Pressable ref={anchorRef} testID={testID} onPress={() => setOpen(true)}>
        {trigger}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          testID={testID ? `${testID}-backdrop` : undefined}
          onPress={() => setOpen(false)}
          style={{ flex: 1 }}
        >
          <View
            testID={testID ? `${testID}-panel` : undefined}
            style={[
              {
                position: 'absolute',
                top: position.top,
                right: position.right,
                minWidth: 200,
                backgroundColor: color.surface,
                borderWidth: 1,
                borderColor: color.dividerStrong,
                paddingVertical: space[1],
              },
              shadow.md,
            ]}
          >
            {header ? (
              <Text
                style={{
                  fontSize: 11,
                  letterSpacing: 1.1,
                  textTransform: 'uppercase',
                  color: alpha(color.text, 50),
                  paddingHorizontal: space[4],
                  paddingTop: space[2],
                  paddingBottom: space[1],
                }}
              >
                {header}
              </Text>
            ) : null}
            {items.map((item, index) => (
              <MenuItemRow
                key={item.key ?? index}
                item={item}
                onSelect={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              />
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItemRow({ item, onSelect }: { item: MenuItem; onSelect: () => void }) {
  return (
    <Pressable
      testID={`menu-item-${item.key ?? item.label}`}
      disabled={item.disabled}
      onPress={item.disabled ? undefined : onSelect}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[2],
        minHeight: 44,
        paddingHorizontal: space[4],
        backgroundColor: item.selected
          ? alpha(color.accent, 22)
          : pressed
            ? color.surface2
            : 'transparent',
        opacity: item.disabled ? 0.5 : 1,
      })}
    >
      <View style={{ width: 16 }}>
        {item.selected ? <Icon name="Check" size={16} color={accentRamp['300']} /> : null}
      </View>
      <Text style={{ fontSize: 14, color: item.selected ? accentRamp['300'] : color.text }}>
        {item.label}
      </Text>
    </Pressable>
  );
}
