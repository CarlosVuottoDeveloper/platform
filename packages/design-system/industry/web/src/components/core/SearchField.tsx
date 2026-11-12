import { useState } from 'react';
import type { CSSProperties, InputHTMLAttributes } from 'react';
import { resolveFieldFrameStyle } from './fieldFrame';
import { Icon } from './Icon';

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  style?: CSSProperties;
}

export function SearchField({
  placeholder = 'Search',
  disabled,
  style,
  onFocus,
  onBlur,
  ...rest
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'relative', ...style }}>
      <input
        type="search"
        placeholder={placeholder}
        disabled={disabled}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...resolveFieldFrameStyle({ focused, hovered, disabled }),
          borderRadius: 'var(--radius-pill)',
          width: '100%',
          minHeight: 'var(--control-h)',
          padding: '0 var(--space-3) 0 var(--space-8)',
          font: 'inherit',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text)',
          caretColor: 'var(--color-accent)',
          cursor: disabled ? 'not-allowed' : undefined,
        }}
        {...rest}
      />
      <span
        style={{
          position: 'absolute',
          left: 'var(--space-3)',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.5,
          pointerEvents: 'none',
          display: 'flex',
        }}
      >
        <Icon name="search" size="sm" />
      </span>
    </div>
  );
}
