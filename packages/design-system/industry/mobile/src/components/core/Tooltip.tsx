import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { color, radii, shadow, fontFamily } from '@industry/tokens';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export function resolveTooltipSide(
  side: TooltipSide,
  measurement: { x: number; y: number; width: number; height: number },
  windowSize: { width: number; height: number },
): TooltipSide {
  const { x, y, width, height } = measurement;
  if (side === 'top' && y < 40) return OPPOSITE.top;
  if (side === 'bottom' && y + height > windowSize.height - 40) return OPPOSITE.bottom;
  if (side === 'left' && x < 60) return OPPOSITE.left;
  if (side === 'right' && x + width > windowSize.width - 60) return OPPOSITE.right;
  return side;
}

function positionFor(resolvedSide: TooltipSide): ViewStyle {
  switch (resolvedSide) {
    case 'top':
      return { bottom: '100%', left: 0, marginBottom: 8 };
    case 'bottom':
      return { top: '100%', left: 0, marginTop: 8 };
    case 'left':
      return { right: '100%', top: 0, marginRight: 8 };
    case 'right':
      return { left: '100%', top: 0, marginLeft: 8 };
  }
}

export interface TooltipProps {
  /** Mono text, one short line. Never information required to complete the task. */
  label: string;
  side?: TooltipSide;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Revealed by a long press — touch has no hover to borrow from. */
export function Tooltip({ label, side = 'top', children, style, testID }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [resolvedSide, setResolvedSide] = useState<TooltipSide>(side);
  const triggerRef = useRef<View>(null);

  useEffect(() => {
    if (!open) {
      setResolvedSide(side);
      return;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const { width: winW, height: winH } = Dimensions.get('window');
      setResolvedSide(
        resolveTooltipSide(side, { x, y, width, height }, { width: winW, height: winH }),
      );
    });
  }, [open, side]);

  return (
    <Pressable
      ref={triggerRef}
      testID={testID}
      onLongPress={() => setOpen(true)}
      onPressOut={() => setOpen(false)}
      delayLongPress={400}
      style={[{ position: 'relative', alignSelf: 'flex-start' }, style]}
    >
      {children}
      {open ? (
        <View
          testID={testID ? `${testID}-bubble` : undefined}
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              paddingHorizontal: 9,
              paddingVertical: 5,
              backgroundColor: color.surface2,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: color.dividerStrong,
            },
            shadow.md,
            positionFor(resolvedSide),
          ]}
        >
          <Text style={{ fontFamily: fontFamily.body, fontSize: 12, color: color.text }}>
            {label}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
