import { useId, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  FIELD_ERROR_STYLE,
  FIELD_HINT_STYLE,
  FIELD_LABEL_STYLE,
  resolveFieldFrameStyle,
} from './fieldFrame';
import { Icon } from './Icon';
import { TEXT_TINT_FILLS } from './stateFills';
import { Popover } from './Popover';

export interface DatePickerProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  value?: Date | null;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  style?: CSSProperties;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isDateDisabled(date: Date, min?: Date, max?: Date): boolean {
  if (min && date < startOfDay(min)) return true;
  if (max && date > startOfDay(max)) return true;
  return false;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

/** Returns a flat, week-padded (multiple of 7) list of dates for the given month; `null` fills the leading/trailing gaps. */
export function buildMonthMatrix(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DatePicker({
  label,
  hint,
  error,
  value,
  onChange,
  min,
  max,
  disabled,
  placeholder = 'Selecione uma data',
  id,
  style,
}: DatePickerProps) {
  const generatedId = useId();
  const fid = id ?? generatedId;
  const hintId = `${fid}-hint`;
  const describedBy = error || hint ? hintId : undefined;
  const [open, setOpen] = useState(false);
  const [triggerHovered, setTriggerHovered] = useState(false);
  const [viewDate, setViewDate] = useState(() => startOfDay(value ?? new Date()));

  function selectDate(date: Date) {
    onChange?.(date);
    setOpen(false);
  }

  function goToMonth(delta: number) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  const cells = buildMonthMatrix(viewDate.getFullYear(), viewDate.getMonth());
  const today = startOfDay(new Date());

  return (
    <div style={{ display: 'grid', gap: 6, ...style }}>
      {label ? (
        <label htmlFor={fid} style={FIELD_LABEL_STYLE}>
          {label}
        </label>
      ) : null}
      <Popover
        open={disabled ? false : open}
        onOpenChange={disabled ? undefined : setOpen}
        side="bottom"
        align="start"
        trigger={
          <div
            id={fid}
            aria-disabled={disabled || undefined}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            onMouseEnter={() => setTriggerHovered(true)}
            onMouseLeave={() => setTriggerHovered(false)}
            style={{
              ...resolveFieldFrameStyle({
                focused: open,
                hovered: triggerHovered,
                invalid: Boolean(error),
                disabled,
              }),
              width: '100%',
              height: 'var(--control-h)',
              padding: '0 var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
              font: 'inherit',
              fontSize: 'var(--text-body)',
              textAlign: 'left',
              color: value
                ? 'var(--color-text)'
                : 'color-mix(in srgb, var(--color-text) 50%, transparent)',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {value ? formatDate(value) : placeholder}
            <Icon name="calendar" size="sm" color="var(--color-text)" />
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-2)', width: 'calc(var(--tap) * 7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <NavButton direction="left" onClick={() => goToMonth(-1)} label="Mês anterior" />
            <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-text)' }}>
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <NavButton direction="right" onClick={() => goToMonth(1)} label="Próximo mês" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {WEEKDAY_LABELS.map((wd, index) => (
              <span
                key={index}
                style={{
                  fontSize: 11,
                  textAlign: 'center',
                  color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
                }}
              >
                {wd}
              </span>
            ))}
            {cells.map((date, index) =>
              date ? (
                <DayCell
                  key={date.toISOString()}
                  date={date}
                  selected={value ? isSameDay(date, value) : false}
                  isToday={isSameDay(date, today)}
                  disabled={isDateDisabled(date, min, max)}
                  onSelect={selectDate}
                />
              ) : (
                <span key={index} />
              ),
            )}
          </div>
        </div>
      </Popover>
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

function NavButton({
  direction,
  onClick,
  label,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 'var(--tap)',
        minHeight: 'var(--tap)',
        background: hovered ? TEXT_TINT_FILLS.hovered : TEXT_TINT_FILLS.rest,
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
      }}
    >
      <Icon
        name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
        size="sm"
        color="var(--color-text)"
      />
    </button>
  );
}

function DayCell({
  date,
  selected,
  isToday,
  disabled,
  onSelect,
}: {
  date: Date;
  selected: boolean;
  isToday: boolean;
  disabled: boolean;
  onSelect: (date: Date) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(date)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-current={isToday ? 'date' : undefined}
      aria-pressed={selected}
      style={{
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        color: selected ? 'var(--color-bg)' : 'var(--color-text)',
        background: selected
          ? 'var(--color-accent)'
          : hovered
            ? TEXT_TINT_FILLS.hovered
            : TEXT_TINT_FILLS.rest,
        borderRadius: 'var(--radius-pill)',
        border:
          isToday && !selected ? '1px solid var(--color-divider-strong)' : '1px solid transparent',
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {date.getDate()}
    </button>
  );
}
