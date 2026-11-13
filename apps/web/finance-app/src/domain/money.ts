export type Cents = number;

const GROUPED_INTEGER = /^\d{1,3}(\.\d{3})+$/;
const PLAIN_INTEGER = /^\d+$/;
const DOT_DECIMAL = /^(\d+)\.(\d{1,2})$/;
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

  const commaParts = text.split(',');
  if (commaParts.length === 2) {
    const [integerPart = '', fractionPart = ''] = commaParts;
    const integer = integerDigits(integerPart);
    return integer !== null && FRACTION.test(fractionPart) ? toCents(integer, fractionPart) : null;
  }
  if (commaParts.length > 2) return null;

  const integer = integerDigits(text);
  if (integer !== null) return toCents(integer, '');

  const dotDecimal = DOT_DECIMAL.exec(text);
  return dotDecimal ? toCents(dotDecimal[1] ?? '', dotDecimal[2] ?? '') : null;
}

export function formatCents(cents: Cents): string {
  return brlFormat.format(cents / 100);
}

export function formatCentsPlain(cents: Cents): string {
  return plainFormat.format(cents / 100);
}
