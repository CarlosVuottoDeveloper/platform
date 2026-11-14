import type { Transaction } from './transaction';

export const TAG_MAX_LENGTH = 30;
export const TAGS_MAX_COUNT = 10;

export function normalizeTag(input: string): string | null {
  const tag = input.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, TAG_MAX_LENGTH);
  return tag === '' ? null : tag;
}

export function knownTags(transactions: Transaction[]): string[] {
  const unique = new Set(transactions.flatMap((transaction) => transaction.tags));
  return [...unique].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
