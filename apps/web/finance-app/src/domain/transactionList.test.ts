import type { Account } from './account';
import type { Category } from './category';
import { tx } from './transaction.test-helpers';
import {
  accountName,
  categoryName,
  groupByDate,
  isPending,
  matchesSearch,
  transactionsOfMonth,
} from './transactionList';

const accounts = [
  { id: 'a1', name: 'Nubank', archived: false },
  { id: 'a2', name: 'Conta antiga', archived: true },
] as Account[];
const categories = [
  { id: 'c1', name: 'Alimentação', archived: false },
  { id: 'c2', name: 'Categoria antiga', archived: true },
] as Category[];

describe('transactionList', () => {
  it('groups by date, most recent first, keeping the order within a day', () => {
    const a = tx({ date: '2026-03-01' });
    const b = tx({ date: '2026-03-05' });
    const c = tx({ date: '2026-03-01' });

    expect(groupByDate([a, b, c])).toEqual([
      { date: '2026-03-05', items: [b] },
      { date: '2026-03-01', items: [a, c] },
    ]);
    expect(groupByDate([])).toEqual([]);
  });

  it('treats only future-dated movements as pending', () => {
    expect(isPending(tx({ date: '2026-03-16' }), '2026-03-15')).toBe(true);
    expect(isPending(tx({ date: '2026-03-15' }), '2026-03-15')).toBe(false);
  });

  it('names accounts and categories even when archived', () => {
    expect(accountName(accounts, 'a1')).toBe('Nubank');
    expect(accountName(accounts, 'a2')).toBe('Conta antiga');
    expect(categoryName(categories, 'c2')).toBe('Categoria antiga');
  });

  it('falls back to a readable label for unknown references', () => {
    expect(accountName(accounts, 'gone')).toBe('Conta removida');
    expect(categoryName(categories, 'gone')).toBe('Sem categoria');
    expect(categoryName(categories, null)).toBe('Sem categoria');
  });

  it('selects the movements of a month', () => {
    const march = tx({ date: '2026-03-31' });
    const april = tx({ date: '2026-04-01' });

    expect(transactionsOfMonth([march, april], '2026-03')).toEqual([march]);
  });

  it('searches the description and tags ignoring case and accents', () => {
    const market = tx({ description: 'Mercado Pão de Açúcar', tags: ['casa'] });

    expect(matchesSearch(market, 'pao de acucar')).toBe(true);
    expect(matchesSearch(market, 'CASA')).toBe(true);
    expect(matchesSearch(market, '  ')).toBe(true);
    expect(matchesSearch(market, 'uber')).toBe(false);
  });
});
