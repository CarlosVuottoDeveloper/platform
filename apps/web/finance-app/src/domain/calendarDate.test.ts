import {
  addMonths,
  dateInMonth,
  formatDateBR,
  formatMonthTitleBR,
  formatMonthShortBR,
  isCalendarDate,
  lastDayOfMonth,
  monthsBetween,
  toCalendarDate,
  yearMonthOf,
} from './calendarDate';

describe('calendarDate', () => {
  it('takes the local day, not the UTC day', () => {
    expect(toCalendarDate(new Date(2026, 10, 30, 23, 30))).toBe('2026-11-30');
    expect(toCalendarDate(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
  });

  it('extracts the month of a date', () => {
    expect(yearMonthOf('2026-03-05')).toBe('2026-03');
  });

  it('adds and subtracts months across year boundaries', () => {
    expect(addMonths('2026-11', 3)).toBe('2027-02');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-05', 0)).toBe('2026-05');
    expect(addMonths('2026-01', -13)).toBe('2024-12');
  });

  it('clamps a day to the end of a short month', () => {
    expect(dateInMonth('2026-02', 31)).toBe('2026-02-28');
    expect(dateInMonth('2028-02', 31)).toBe('2028-02-29');
    expect(dateInMonth('2026-04', 31)).toBe('2026-04-30');
    expect(dateInMonth('2026-03', 5)).toBe('2026-03-05');
  });

  it('finds the last day of a month', () => {
    expect(lastDayOfMonth('2026-02')).toBe('2026-02-28');
    expect(lastDayOfMonth('2026-12')).toBe('2026-12-31');
  });

  it('lists months inclusively', () => {
    expect(monthsBetween('2026-11', '2027-01')).toEqual(['2026-11', '2026-12', '2027-01']);
    expect(monthsBetween('2026-05', '2026-05')).toEqual(['2026-05']);
    expect(monthsBetween('2026-06', '2026-05')).toEqual([]);
  });

  it('formats dates and months for display', () => {
    expect(formatDateBR('2026-03-05')).toBe('05/03/2026');
    expect(formatMonthTitleBR('2026-03')).toBe('Março 2026');
    expect(formatMonthTitleBR('2026-11')).toBe('Novembro 2026');
    expect(formatMonthShortBR('2026-03')).toBe('mar/26');
    expect(formatMonthShortBR('2027-12')).toBe('dez/27');
  });

  it('recognises real calendar dates only', () => {
    expect(isCalendarDate('2026-02-28')).toBe(true);
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('2026-13-01')).toBe(false);
    expect(isCalendarDate('26-01-01')).toBe(false);
    expect(isCalendarDate('')).toBe(false);
  });
});
