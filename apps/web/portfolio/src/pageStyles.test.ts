import { readFileSync } from 'fs';
import { join } from 'path';

const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');

describe('page styles', () => {
  it('keeps anchors, the skip link and keyboard focus clear of the sticky header', () => {
    expect(html).toMatch(
      /html\s*{[^}]*scroll-padding-top:\s*calc\(var\(--control-h\) \+ var\(--space-12\)\)/,
    );
  });

  it('scrolls smoothly only for people who have not asked for less motion', () => {
    expect(html).toMatch(
      /@media \(prefers-reduced-motion: no-preference\)\s*{\s*html\s*{\s*scroll-behavior: smooth;/,
    );
  });
});
