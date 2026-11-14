import { useState } from 'react';
import { TextField } from '@industry/web';
import { formatCentsPlain, parseBRLToCents } from '../../domain/money';
import type { Cents } from '../../domain/money';

interface MoneyFieldProps {
  label: string;
  value: Cents | null;
  onChange: (value: Cents | null, text: string) => void;
  error?: string;
}

export function MoneyField({ label, value, onChange, error }: MoneyFieldProps) {
  const [text, setText] = useState(value === null ? '' : formatCentsPlain(value));
  const [unreadable, setUnreadable] = useState(false);

  function handleChange(nextText: string) {
    setText(nextText);
    setUnreadable(false);
    onChange(parseBRLToCents(nextText), nextText);
  }

  function handleBlur() {
    if (text.trim() === '') return;
    const cents = parseBRLToCents(text);
    if (cents === null) {
      setUnreadable(true);
      return;
    }
    setText(formatCentsPlain(cents));
  }

  return (
    <TextField
      label={label}
      value={text}
      inputMode="decimal"
      placeholder="0,00"
      error={error ?? (unreadable ? 'Valor inválido' : undefined)}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={handleBlur}
    />
  );
}
