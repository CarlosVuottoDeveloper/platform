import { useId, useState } from 'react';
import type {
  CSSProperties,
  FocusEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import {
  FIELD_ERROR_STYLE,
  FIELD_HINT_STYLE,
  FIELD_LABEL_STYLE,
  resolveFieldFrameStyle,
} from './fieldFrame';

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'style' | 'children' | 'onFocus' | 'onBlur'
> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  multiline?: boolean;
  rows?: number;
  style?: CSSProperties;
  onFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function TextField({
  label,
  hint,
  error,
  multiline,
  rows = 3,
  id,
  disabled,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const fid = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hintId = `${fid}-hint`;
  const describedBy = error || hint ? hintId : undefined;

  const fieldStyle: CSSProperties = {
    ...resolveFieldFrameStyle({ focused, hovered, invalid: Boolean(error), disabled }),
    width: '100%',
    minHeight: multiline ? 104 : 'var(--control-h)',
    padding: multiline ? 'var(--space-2) var(--space-3)' : '0 var(--space-3)',
    font: 'inherit',
    fontSize: 'var(--text-body)',
    color: 'var(--color-text)',
    caretColor: 'var(--color-accent)',
    resize: multiline ? 'vertical' : undefined,
    cursor: disabled ? 'not-allowed' : undefined,
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      {multiline ? (
        <textarea
          id={fid}
          rows={rows}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={fieldStyle}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fid}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={fieldStyle}
          {...rest}
        />
      )}
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
