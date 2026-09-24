import { formatDateLong, formatDateTimeShort, formatDayMonth } from './ticket';

const date = new Date(2026, 2, 12, 9, 20);

describe('formatDayMonth', () => {
  it('formats as day and abbreviated month', () => {
    expect(formatDayMonth(date)).toBe('12 mar');
  });

  it('pads single-digit days', () => {
    expect(formatDayMonth(new Date(2026, 0, 5))).toBe('05 jan');
  });

  it('returns an empty string for a null date', () => {
    expect(formatDayMonth(null)).toBe('');
  });
});

describe('formatDateLong', () => {
  it('formats as day, abbreviated month and year', () => {
    expect(formatDateLong(date)).toBe('12 mar 2026');
  });

  it('returns an empty string for a null date', () => {
    expect(formatDateLong(null)).toBe('');
  });
});

describe('formatDateTimeShort', () => {
  it('formats as day, abbreviated month and 24h time', () => {
    expect(formatDateTimeShort(date)).toBe('12 mar · 09:20');
  });

  it('pads the hour and covers December', () => {
    expect(formatDateTimeShort(new Date(2026, 11, 31, 23, 5))).toBe('31 dez · 23:05');
  });

  it('returns an empty string for a null date', () => {
    expect(formatDateTimeShort(null)).toBe('');
  });
});
