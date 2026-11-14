import { DEFAULT_CATEGORIES, categoriesOfKind } from './category';
import type { Category } from './category';

describe('category', () => {
  it('ships seven expense and four income defaults with unique, stable ids', () => {
    const expenses = DEFAULT_CATEGORIES.filter((category) => category.kind === 'expense');
    const incomes = DEFAULT_CATEGORIES.filter((category) => category.kind === 'income');

    expect(expenses.map((category) => category.name)).toEqual([
      'Alimentação',
      'Moradia',
      'Transporte',
      'Saúde',
      'Lazer',
      'Educação',
      'Outros',
    ]);
    expect(incomes.map((category) => category.name)).toEqual([
      'Salário',
      'Freelance',
      'Rendimentos',
      'Outros',
    ]);
    expect(new Set(DEFAULT_CATEGORIES.map((category) => category.id)).size).toBe(11);
    expect(DEFAULT_CATEGORIES[0]?.id).toBe('default-expense-alimentacao');
    expect(DEFAULT_CATEGORIES.every((category) => !category.archived)).toBe(true);
  });

  it('lists the active categories of a kind, sorted by name', () => {
    const category = (overrides: Partial<Category>): Category => ({
      id: 'c',
      name: 'C',
      kind: 'expense',
      color: 'viz-1',
      icon: 'tag',
      archived: false,
      ...overrides,
    });
    const mercado = category({ id: '1', name: 'Mercado' });
    const aluguel = category({ id: '2', name: 'Aluguel' });
    const salario = category({ id: '3', name: 'Salário', kind: 'income' });
    const antiga = category({ id: '4', name: 'Antiga', archived: true });

    expect(categoriesOfKind([mercado, salario, antiga, aluguel], 'expense')).toEqual([
      aluguel,
      mercado,
    ]);
  });
});
