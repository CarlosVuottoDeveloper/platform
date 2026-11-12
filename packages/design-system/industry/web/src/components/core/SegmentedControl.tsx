import { useState } from 'react';
import type { ChangeEvent, CSSProperties, ReactNode } from 'react';
import { PillSegment } from './PillSegment';

export interface SegmentOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

export interface SegmentedControlProps {
  name: string;
  options?: (string | SegmentOption)[];
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
}

function resolveOption(option: string | SegmentOption): SegmentOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export function SegmentedControl({
  name,
  options = [],
  value,
  onChange,
  style,
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      style={{
        display: 'inline-flex',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-pill)',
        ...style,
      }}
    >
      {options.map((option) => {
        const opt = resolveOption(option);
        return (
          <SegmentItem
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

function SegmentItem({
  name,
  option,
  checked,
  onChange,
}: {
  name: string;
  option: SegmentOption;
  checked: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <PillSegment
      as="label"
      active={checked}
      focused={focused}
      icon={option.icon}
      label={option.label}
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
    </PillSegment>
  );
}
