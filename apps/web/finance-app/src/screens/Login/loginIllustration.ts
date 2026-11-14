const COLUMNS = 14;
const ROWS = 6;

export const ILLUSTRATION_COLUMNS = COLUMNS;

export const DAILY_SPENDING_ILLUSTRATION: number[] = Array.from(
  { length: COLUMNS * ROWS },
  (_, index) => ((index * 37 + (index % 5) * 11) % 100) / 100,
);
