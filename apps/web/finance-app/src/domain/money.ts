export type Cents = number;

const GROUPED_INTEGER = /^\d{1,3}(\.\d{3})+$/;
const PLAIN_INTEGER = /^\d+$/;
const DOT_DECIMAL = /^\d+\.\d{1,2}$/;
const FRACTION = /^\d{1,2}$/;

const brlFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const plainFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function integerDigits(text: string): string | null {
  if (PLAIN_INTEGER.test(text)) return text;
  if (GROUPED_INTEGER.test(text)) return text.replaceAll('.', '');
  return null;
}

function toCents(integer: string, fraction: string): Cents {
  return Number(integer) * 100 + Number(fraction.padEnd(2, '0'));
}

export function parseBRLToCents(input: string): Cents | null {
  const text = input.replace(/R\$/i, '').replace(/\s/g, '');

  const comma = text.indexOf(',');
  if (comma !== -1) {
    const integer = integerDigits(text.slice(0, comma));
    const fraction = text.slice(comma + 1);
    return integer !== null && FRACTION.test(fraction) ? toCents(integer, fraction) : null;
  }

  const integer = integerDigits(text);
  if (integer !== null) return toCents(integer, '');

  if (!DOT_DECIMAL.test(text)) return null;
  const dot = text.indexOf('.');
  return toCents(text.slice(0, dot), text.slice(dot + 1));
}

export function formatCents(cents: Cents): string {
  return brlFormat.format(cents / 100);
}

export function formatCentsPlain(cents: Cents): string {
  return plainFormat.format(cents / 100);
}
