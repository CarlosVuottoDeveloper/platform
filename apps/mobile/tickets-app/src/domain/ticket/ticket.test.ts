import {
  TICKET_TITLE_MAX_LENGTH,
  formatDateLong,
  formatDateTimeShort,
  formatDayMonth,
  truncateTitle,
} from './ticket';

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

describe('truncateTitle', () => {
  it('caps titles at 100 characters', () => {
    expect(TICKET_TITLE_MAX_LENGTH).toBe(100);
  });

  it('returns titles within the limit untouched', () => {
    const title = 'x'.repeat(TICKET_TITLE_MAX_LENGTH);

    expect(truncateTitle(title)).toBe(title);
  });

  it('cuts longer titles at the limit and appends an ellipsis', () => {
    const title = `${'x'.repeat(TICKET_TITLE_MAX_LENGTH)}extra`;

    expect(truncateTitle(title)).toBe(`${'x'.repeat(TICKET_TITLE_MAX_LENGTH)}…`);
  });

  it('drops trailing whitespace before the ellipsis', () => {
    const title = `${'x'.repeat(TICKET_TITLE_MAX_LENGTH - 2)}  extra`;

    expect(truncateTitle(title)).toBe(`${'x'.repeat(TICKET_TITLE_MAX_LENGTH - 2)}…`);
  });
});
