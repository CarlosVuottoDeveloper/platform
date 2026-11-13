import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function findStyleSheets(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return findStyleSheets(path);
    return entry.endsWith('.styles.ts') ? [path] : [];
  });
}

const TEXT_PROPS = ['fontSize', 'fontWeight', 'lineHeight'];

describe('typography', () => {
  it.each(findStyleSheets(__dirname))('sets fontFamily on every text style in %s', (path) => {
    const sheets = Object.values(
      jest.requireActual<Record<string, Record<string, Record<string, unknown>>>>(path),
    );
    const missing = sheets
      .flatMap((sheet) => Object.entries(sheet))
      .filter(([, style]) => TEXT_PROPS.some((prop) => prop in style) && !('fontFamily' in style))
      .map(([name]) => name);
    expect(missing).toEqual([]);
  });
});
