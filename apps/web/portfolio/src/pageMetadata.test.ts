import { readFileSync } from 'fs';
import { join } from 'path';
import { CONTACT, WHATSAPP_URL } from './content/contact';

const SITE_URL = 'https://carlos-vuotto.vercel.app/';

function parsePage() {
  document.documentElement.innerHTML = readFileSync(join(__dirname, '..', 'index.html'), 'utf8')
    .replace(/^<!doctype html>/i, '')
    .replace(/<\/?html[^>]*>/g, '');
  return document;
}

function metaContent(page: Document, selector: string) {
  return page.querySelector(selector)?.getAttribute('content');
}

describe('page metadata', () => {
  it('names the canonical address so search engines index a single URL', () => {
    const page = parsePage();

    expect(page.querySelector('link[rel="canonical"]')).toHaveAttribute('href', SITE_URL);
    expect(metaContent(page, 'meta[property="og:url"]')).toBe(SITE_URL);
  });

  it('describes the share image for people who cannot see it', () => {
    const page = parsePage();
    const alt = metaContent(page, 'meta[property="og:image:alt"]');

    expect(alt).toMatch(/Carlos Vuotto/);
    expect(metaContent(page, 'meta[name="twitter:image:alt"]')).toBe(alt);
  });

  it('still introduces Carlos and his contacts when JavaScript is off', () => {
    const page = parsePage();
    const fallback = document.createElement('div');
    fallback.innerHTML = page.querySelector('noscript')?.textContent ?? '';
    const hrefs = Array.from(fallback.querySelectorAll('a')).map((link) =>
      link.getAttribute('href'),
    );

    expect(fallback.querySelector('h1')).toHaveTextContent(CONTACT.name);
    expect(hrefs).toEqual([WHATSAPP_URL, CONTACT.linkedin, CONTACT.github]);
  });
});
