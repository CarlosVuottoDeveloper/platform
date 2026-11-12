import type { CSSProperties } from 'react';

interface FieldFrameState {
  focused?: boolean;
  invalid?: boolean;
  hovered?: boolean;
  disabled?: boolean;
}

function resolveBorderColor({ focused, invalid, hovered, disabled }: FieldFrameState) {
  if (invalid) return 'var(--color-danger)';
  if (focused) return 'var(--color-accent)';
  return hovered && !disabled ? 'var(--color-neutral-500)' : 'var(--color-control-border)';
}

export function resolveFieldFrameStyle(state: FieldFrameState): CSSProperties {
  return {
    background: 'var(--color-surface)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 'var(--radius-md)',
    borderColor: resolveBorderColor(state),
    opacity: state.disabled ? 0.45 : 1,
  };
}

export const FIELD_LABEL_STYLE: CSSProperties = {
  fontSize: 'var(--text-h6)',
  color: 'color-mix(in srgb, var(--color-text) 70%, transparent)',
};
export const FIELD_HINT_STYLE: CSSProperties = {
  fontSize: 12,
  color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
};
export const FIELD_ERROR_STYLE: CSSProperties = { fontSize: 12, color: 'var(--color-danger-300)' };
