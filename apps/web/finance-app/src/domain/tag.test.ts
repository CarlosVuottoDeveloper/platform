import { knownTags, normalizeTag } from './tag';
import { tx } from './transaction.test-helpers';

describe('tag', () => {
  it('normalises spacing and case', () => {
    expect(normalizeTag('  Mercado ')).toBe('mercado');
    expect(normalizeTag('Viagem  de   Férias')).toBe('viagem de férias');
  });

  it('rejects empty tags and trims long ones to 30 characters', () => {
    expect(normalizeTag('   ')).toBeNull();
    expect(normalizeTag('a'.repeat(40))).toBe('a'.repeat(30));
  });

  it('lists the tags already used, unique and in alphabetical order', () => {
    expect(
      knownTags([
        tx({ tags: ['mercado', 'casa'] }),
        tx({ tags: ['casa'] }),
        tx({ tags: ['água'] }),
      ]),
    ).toEqual(['água', 'casa', 'mercado']);
  });
});
