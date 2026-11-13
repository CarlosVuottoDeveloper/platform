export type CalendarDate = string;
export type YearMonth = string;

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number) => String(value).padStart(2, '0');

function monthIndex(month: YearMonth): number {
  const [year = '0', monthNumber = '1'] = month.split('-');
  return Number(year) * 12 + Number(monthNumber) - 1;
}

function fromMonthIndex(index: number): YearMonth {
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

function daysInMonth(month: YearMonth): number {
  const [year = '0', monthNumber = '1'] = month.split('-');
  return new Date(Number(year), Number(monthNumber), 0).getDate();
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
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function formatMonthBR(month: YearMonth): string {
  const [year = '0', monthNumber = '1'] = month.split('-');
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(Number(year), Number(monthNumber) - 1, 1),
  );
}

export function isCalendarDate(text: string): boolean {
  const match = CALENDAR_DATE.exec(text);
  if (!match) return false;
  const monthNumber = Number(match[2]);
  if (monthNumber < 1 || monthNumber > 12) return false;
  const day = Number(match[3]);
  return day >= 1 && day <= daysInMonth(text.slice(0, 7));
}
