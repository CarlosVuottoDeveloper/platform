import { useState } from 'react';
import { TextField } from '@industry/web';
import {
  MAX_AMOUNT_CENTS,
  formatCents,
  formatCentsPlain,
  parseBRLToCents,
} from '../../domain/money';
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
  const cents = parseBRLToCents(text);
  const overLimit = cents !== null && cents > MAX_AMOUNT_CENTS;

  function ownError(): string | undefined {
    if (overLimit) return 'Valor acima do limite';
    return unreadable ? 'Valor inválido' : undefined;
  }

  function handleChange(nextText: string) {
    const nextCents = parseBRLToCents(nextText);
    setText(nextText);
    setUnreadable(false);
    onChange(nextCents !== null && nextCents <= MAX_AMOUNT_CENTS ? nextCents : null, nextText);
  }

  function handleBlur() {
    if (text.trim() === '') return;
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
      hint={cents !== null && !overLimit ? formatCents(cents) : undefined}
      error={ownError() ?? error}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={handleBlur}
    />
  );
}
