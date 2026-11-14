export type CategoryKind = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  icon: string;
  archived: boolean;
}

export type CategoryInput = Omit<Category, 'id' | 'archived'>;

const defaultCategory = (
  id: string,
  name: string,
  kind: CategoryKind,
  color: string,
  icon: string,
): Category => ({ id: `default-${kind}-${id}`, name, kind, color, icon, archived: false });

export const DEFAULT_CATEGORIES: Category[] = [
  defaultCategory('alimentacao', 'Alimentação', 'expense', 'viz-5', 'utensils'),
  defaultCategory('moradia', 'Moradia', 'expense', 'viz-1', 'house'),
  defaultCategory('transporte', 'Transporte', 'expense', 'viz-2', 'car'),
  defaultCategory('saude', 'Saúde', 'expense', 'viz-3', 'heart-pulse'),
  defaultCategory('lazer', 'Lazer', 'expense', 'viz-6', 'gamepad-2'),
  defaultCategory('educacao', 'Educação', 'expense', 'viz-4', 'graduation-cap'),
  defaultCategory('outros', 'Outros', 'expense', 'viz-1', 'tag'),
  defaultCategory('salario', 'Salário', 'income', 'viz-3', 'briefcase'),
  defaultCategory('freelance', 'Freelance', 'income', 'viz-2', 'hand-coins'),
  defaultCategory('rendimentos', 'Rendimentos', 'income', 'viz-4', 'trending-up'),
  defaultCategory('outros', 'Outros', 'income', 'viz-6', 'tag'),
];

export function categoriesOfKind(categories: Category[], kind: CategoryKind): Category[] {
  return categories
    .filter((category) => category.kind === kind && !category.archived)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
