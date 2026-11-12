import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  alpha,
  color,
  control,
  danger,
  fontSize,
  radii,
  semanticColor,
  space,
} from '@industry/tokens';
import { Icon } from './Icon';

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
  style?: StyleProp<ViewStyle>;
  testID?: string;
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
  disabled = false,
  placeholder = 'Selecionar data',
  style,
  testID,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => startOfDay(value ?? new Date()));
  const borderColor = error ? semanticColor.danger : color.controlBorder;
  const close = () => setOpen(false);

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
    <View style={[{ gap: 6 }, style]}>
      {label ? (
        <Text style={{ fontSize: fontSize.h6, color: alpha(color.text, 70) }}>{label}</Text>
      ) : null}
      <Pressable
        testID={testID}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={value ? formatDate(value) : placeholder}
        accessibilityState={{ disabled }}
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: control.height,
          paddingHorizontal: space[3],
          backgroundColor: color.surface,
          borderWidth: 1,
          borderColor,
          borderRadius: radii.md,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: fontSize.body,
            color: value ? color.text : alpha(color.text, 50),
          }}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Icon name="Calendar" size="sm" color={alpha(color.text, 70)} />
      </Pressable>
      {error ? (
        <Text style={{ fontSize: 12, color: danger['300'] }}>{error}</Text>
      ) : hint ? (
        <Text style={{ fontSize: 12, color: alpha(color.text, 50) }}>{hint}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable
          testID={testID ? `${testID}-backdrop` : undefined}
          onPress={close}
          style={{ flex: 1, backgroundColor: alpha(color.bg, 70), justifyContent: 'flex-end' }}
        >
          <View
            testID={testID ? `${testID}-panel` : undefined}
            onStartShouldSetResponder={() => true}
            style={{
              backgroundColor: color.surface,
              borderTopWidth: 1,
              borderColor: color.divider,
              borderTopLeftRadius: radii.lg,
              borderTopRightRadius: radii.lg,
              padding: space[4],
              gap: space[3],
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <NavButton icon="ChevronLeft" label="Mês anterior" onPress={() => goToMonth(-1)} />
              <Text style={{ fontSize: 14, color: color.text }}>
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </Text>
              <NavButton icon="ChevronRight" label="Próximo mês" onPress={() => goToMonth(1)} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              {WEEKDAY_LABELS.map((wd, index) => (
                <Text
                  key={index}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 11,
                    color: alpha(color.text, 50),
                  }}
                >
                  {wd}
                </Text>
              ))}
            </View>
            {Array.from({ length: cells.length / 7 }).map((_, week) => (
              <View key={week} style={{ flexDirection: 'row' }}>
                {cells
                  .slice(week * 7, week * 7 + 7)
                  .map((date, index) =>
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
                      <View key={index} style={{ flex: 1 }} />
                    ),
                  )}
              </View>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function NavButton({
  icon,
  label,
  onPress,
}: {
  icon: 'ChevronLeft' | 'ChevronRight';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        padding: space[1],
        borderRadius: radii.pill,
        backgroundColor: pressed ? color.surface2 : 'transparent',
      })}
    >
      <Icon name={icon} size="sm" color={color.text} />
    </Pressable>
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
  return (
    <Pressable
      testID={`date-cell-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
      disabled={disabled}
      onPress={() => onSelect(date)}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      style={({ pressed }) => ({
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? color.accent : pressed ? color.surface2 : 'transparent',
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: isToday && !selected ? color.dividerStrong : 'transparent',
        opacity: disabled ? 0.35 : 1,
      })}
    >
      <Text style={{ fontSize: 12, color: selected ? color.bg : color.text }}>
        {date.getDate()}
      </Text>
    </Pressable>
  );
}
