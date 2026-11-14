import { formatCents, formatCentsPlain, parseBRLToCents } from './money';

const withPlainSpaces = (text: string) => text.replace(/\s/g, ' ');

describe('parseBRLToCents', () => {
  it.each([
    ['1.234,56', 123456],
    ['1234.56', 123456],
    ['R$ 10', 1000],
    ['0,1', 10],
    ['19,99', 1999],
    ['1.234', 123400],
    ['1.234.567,89', 123456789],
    ['  42  ', 4200],
    ['0', 0],
    ['10.5', 1050],
  ])('reads %s as %d cents', (input, cents) => {
    expect(parseBRLToCents(input)).toBe(cents);
  });

  it.each(['', '   ', 'abc', '-5', '1,005', '1,2,3', '12a', 'R$', '1..2', '1.23.456', ',5', '5,'])(
    'rejects %p',
    (input) => {
      expect(parseBRLToCents(input)).toBeNull();
    },
  );

  it('keeps exact cents where floating point would drift', () => {
    expect(parseBRLToCents('0,29')).toBe(29);
    expect(parseBRLToCents('1,15')).toBe(115);
    expect(parseBRLToCents('4,35')).toBe(435);
  });
});

describe('formatCents', () => {
  it('formats in Brazilian real', () => {
    expect(withPlainSpaces(formatCents(123456))).toBe('R$ 1.234,56');
    expect(withPlainSpaces(formatCents(0))).toBe('R$ 0,00');
    expect(withPlainSpaces(formatCents(5))).toBe('R$ 0,05');
  });

  it('formats negative amounts', () => {
    expect(withPlainSpaces(formatCents(-500))).toBe('-R$ 5,00');
  });
});

describe('formatCentsPlain', () => {
  it('formats without the currency symbol', () => {
    expect(formatCentsPlain(123456)).toBe('1.234,56');
    expect(formatCentsPlain(1000)).toBe('10,00');
    expect(formatCentsPlain(-50)).toBe('-0,50');
  });

  it('round-trips through the parser', () => {
    expect(parseBRLToCents(formatCentsPlain(987654321))).toBe(987654321);
  });
});
