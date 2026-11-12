import { useState } from 'react';
import type { ChangeEvent, CSSProperties, FocusEvent, InputHTMLAttributes, ReactNode } from 'react';

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'style' | 'children'
> {
  label?: ReactNode;
  style?: CSSProperties;
}

function resolveBorderColor(checked: boolean, hovered: boolean) {
  if (checked) return hovered ? 'var(--color-accent-300)' : 'var(--color-accent-400)';
  return hovered ? 'var(--color-neutral-500)' : 'var(--color-control-border)';
}

export function Switch({
  label,
  checked,
  defaultChecked,
  disabled,
  style,
  onChange,
  onFocus,
  onBlur,
  ...rest
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isChecked = checked ?? internalChecked;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInternalChecked(e.target.checked);
    onChange?.(e);
  };
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        minHeight: 'var(--tap)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 'var(--text-body)',
        ...style,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        {...rest}
      />
      <span
        style={{
          position: 'relative',
          width: 44,
          height: 24,
          flex: 'none',
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: 'var(--radius-pill)',
          borderColor: resolveBorderColor(isChecked, hovered),
          background: isChecked ? 'var(--color-accent-800)' : 'var(--color-surface-2)',
          opacity: disabled ? 0.45 : 1,
          outline: focused ? '2px solid var(--color-accent)' : 'none',
          outlineOffset: 2,
          transition: 'background 140ms ease, border-color 140ms ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: isChecked ? 23 : 3,
            width: 16,
            height: 16,
            borderRadius: 'var(--radius-pill)',
            background: isChecked ? 'var(--color-accent)' : 'var(--color-neutral-400)',
            transition: 'left 140ms ease, background 140ms ease',
          }}
        />
      </span>
      {label}
    </label>
  );
}
