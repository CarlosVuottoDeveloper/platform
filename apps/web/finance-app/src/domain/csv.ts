const SEPARATOR = ';';
const BYTE_ORDER_MARK = '﻿';
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[";\r\n]/;

function toCell(text: string): string {
  const neutral = FORMULA_TRIGGER.test(text) ? `'${text}` : text;
  return NEEDS_QUOTES.test(neutral) ? `"${neutral.replaceAll('"', '""')}"` : neutral;
}

export function toCsv(rows: string[][]): string {
  return BYTE_ORDER_MARK + rows.map((row) => `${row.map(toCell).join(SEPARATOR)}\r\n`).join('');
}
