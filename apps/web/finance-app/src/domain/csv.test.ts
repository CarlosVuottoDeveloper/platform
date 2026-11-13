import { toCsv } from './csv';

describe('toCsv', () => {
  it('separates cells with semicolons, ends rows with CRLF and starts with a BOM', () => {
    expect(toCsv([['a', 'b']])).toBe('﻿a;b\r\n');
    expect(toCsv([['a'], ['b']])).toBe('﻿a\r\nb\r\n');
  });

  it('quotes cells containing separators, quotes or line breaks', () => {
    expect(toCsv([['x;y', 'diz "oi"', 'linha1\nlinha2']])).toBe(
      '﻿"x;y";"diz ""oi""";"linha1\nlinha2"\r\n',
    );
  });

  it('neutralises cells a spreadsheet would run as a formula', () => {
    expect(toCsv([['=SOMA(A1)', '+1', '-2', '@x']])).toBe("﻿'=SOMA(A1);'+1;'-2;'@x\r\n");
    expect(toCsv([['\t=1', '\r=1']])).toBe('﻿\'\t=1;"\'\r=1"\r\n');
  });

  it('neutralises and quotes at the same time', () => {
    expect(toCsv([['=1;2']])).toBe('﻿"\'=1;2"\r\n');
  });

  it('leaves ordinary text, including negative-looking words, readable', () => {
    expect(toCsv([['Padaria', '1234,56', 'café da manhã']])).toBe(
      '﻿Padaria;1234,56;café da manhã\r\n',
    );
  });

  it('returns only the BOM for no rows', () => {
    expect(toCsv([])).toBe('﻿');
  });
});
