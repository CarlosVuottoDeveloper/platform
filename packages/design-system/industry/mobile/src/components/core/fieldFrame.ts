import type { TextStyle, ViewStyle } from 'react-native';
import { alpha, color, danger, fontSize, radii, semanticColor } from '@industry/tokens';

interface FieldFrameState {
  focused?: boolean;
  invalid?: boolean;
  disabled?: boolean;
}

export function resolveFieldFrameStyle({
  focused = false,
  invalid = false,
  disabled = false,
}: FieldFrameState): ViewStyle {
  return {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderRadius: radii.md,
    borderColor: invalid ? semanticColor.danger : focused ? color.accent : color.controlBorder,
    opacity: disabled ? 0.45 : 1,
  };
}

export const fieldLabelStyle: TextStyle = { fontSize: fontSize.h6, color: alpha(color.text, 70) };
export const fieldHintStyle: TextStyle = { fontSize: 12, color: alpha(color.text, 50) };
export const fieldErrorStyle: TextStyle = { fontSize: 12, color: danger['300'] };
