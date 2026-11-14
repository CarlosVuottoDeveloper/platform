export type CalendarDate = string;
export type YearMonth = string;

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number) => String(value).padStart(2, '0');

const yearOf = (month: YearMonth) => Number(month.slice(0, 4));
const monthNumberOf = (month: YearMonth) => Number(month.slice(5, 7));

function monthIndex(month: YearMonth): number {
  return yearOf(month) * 12 + monthNumberOf(month) - 1;
}

function fromMonthIndex(index: number): YearMonth {
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

function daysInMonth(month: YearMonth): number {
  return new Date(yearOf(month), monthNumberOf(month), 0).getDate();
}

export function toCalendarDate(now: Date): CalendarDate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function yearMonthOf(date: CalendarDate): YearMonth {
  return date.slice(0, 7);
}

export function addMonths(month: YearMonth, count: number): YearMonth {
  return fromMonthIndex(monthIndex(month) + count);
}

export function dateInMonth(month: YearMonth, day: number): CalendarDate {
  return `${month}-${pad(Math.min(day, daysInMonth(month)))}`;
}

export function lastDayOfMonth(month: YearMonth): CalendarDate {
  return `${month}-${pad(daysInMonth(month))}`;
}

export function monthsBetween(first: YearMonth, last: YearMonth): YearMonth[] {
  const start = monthIndex(first);
  const length = Math.max(0, monthIndex(last) - start + 1);
  return Array.from({ length }, (_, offset) => fromMonthIndex(start + offset));
}

export function formatDateBR(date: CalendarDate): string {
  return `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}`;
}

export function formatMonthTitleBR(month: YearMonth): string {
  const name = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(yearOf(month), monthNumberOf(month) - 1, 1),
  );
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${yearOf(month)}`;
}

export function formatMonthShortBR(month: YearMonth): string {
  const name = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(new Date(yearOf(month), monthNumberOf(month) - 1, 1))
    .replace('.', '');
  return `${name}/${month.slice(2, 4)}`;
}

export function isCalendarDate(text: string): boolean {
  if (!CALENDAR_DATE.test(text)) return false;
  const monthNumber = monthNumberOf(text);
  if (monthNumber < 1 || monthNumber > 12) return false;
  const day = Number(text.slice(8, 10));
  return day >= 1 && day <= daysInMonth(text.slice(0, 7));
}
