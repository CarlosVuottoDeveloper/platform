import { useId, useState } from 'react';
import type { CSSProperties, FocusEvent, ReactNode, SelectHTMLAttributes } from 'react';
import {
  FIELD_ERROR_STYLE,
  FIELD_HINT_STYLE,
  FIELD_LABEL_STYLE,
  resolveFieldFrameStyle,
} from './fieldFrame';
import { Icon } from './Icon';

export type SelectSize = 'md' | 'sm';
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'style' | 'children'
> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Plain strings or {value,label} pairs. */
  options?: (string | SelectOption)[];
  size?: SelectSize;
  style?: CSSProperties;
}

export function Select({
  label,
  hint,
  error,
  options = [],
  size = 'md',
  id,
  disabled,
  style,
  onFocus,
  onBlur,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const fid = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hintId = `${fid}-hint`;
  const describedBy = error || hint ? hintId : undefined;
  const height = size === 'sm' ? 'var(--control-h-sm)' : 'var(--control-h)';

  const handleFocus = (e: FocusEvent<HTMLSelectElement>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: FocusEvent<HTMLSelectElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <div style={{ display: 'grid', gap: 6, ...style }}>
      {label ? (
        <label htmlFor={fid} style={FIELD_LABEL_STYLE}>
          {label}
        </label>
      ) : null}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height,
          ...resolveFieldFrameStyle({ focused, hovered, invalid: Boolean(error), disabled }),
        }}
      >
        <select
          id={fid}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            flex: 1,
            height: '100%',
            padding: '0 34px 0 var(--space-3)',
            background: 'none',
            border: 'none',
            outline: 'none',
            font: 'inherit',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...rest}
        >
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return (
              <option
                key={opt.value}
                value={opt.value}
                style={{ background: 'var(--color-surface-2)' }}
              >
                {opt.label}
              </option>
            );
          })}
        </select>
        <span style={{ position: 'absolute', right: 10, display: 'flex', pointerEvents: 'none' }}>
          <Icon name="chevron-down" size="sm" color="var(--color-text)" />
        </span>
      </div>
      {error ? (
        <span id={hintId} style={FIELD_ERROR_STYLE}>
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} style={FIELD_HINT_STYLE}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
