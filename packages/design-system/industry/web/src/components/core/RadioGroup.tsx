import { useState } from 'react';
import type { ChangeEvent, CSSProperties, ReactNode } from 'react';
import { FIELD_LABEL_STYLE } from './fieldFrame';

export interface RadioOption {
  value: string;
  label: ReactNode;
}

export interface RadioGroupProps {
  label?: ReactNode;
  name: string;
  options?: (string | RadioOption)[];
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}

function resolveOption(option: string | RadioOption): RadioOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export function RadioGroup({ label, name, options = [], value, onChange, style }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label={typeof label === 'string' ? label : undefined}
      style={{ display: 'grid', gap: 'var(--space-2)', ...style }}
    >
      {label ? <span style={FIELD_LABEL_STYLE}>{label}</span> : null}
      {options.map((option) => {
        const opt = resolveOption(option);
        return (
          <RadioOptionItem
            key={opt.value}
            name={name}
            option={opt}
            checked={value === opt.value}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
}

function RadioOptionItem({
  name,
  option,
  checked,
  onChange,
}: {
  name: string;
  option: RadioOption;
  checked: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        minHeight: 'var(--tap)',
        cursor: 'pointer',
        fontSize: 'var(--text-body)',
      }}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={checked}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />
      <span
        style={{
          width: 18,
          height: 18,
          flex: 'none',
          borderRadius: '50%',
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: checked || hovered ? 'var(--color-accent)' : 'var(--color-control-border)',
          background: checked ? 'var(--color-accent)' : 'transparent',
          boxShadow: checked ? 'inset 0 0 0 4px var(--color-bg)' : 'none',
          outline: focused ? '2px solid var(--color-accent)' : 'none',
          outlineOffset: 2,
        }}
      />
      {option.label}
    </label>
  );
}
