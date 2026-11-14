import { useState } from 'react';
import { Button, Icon } from '@industry/web';
import type { IconName } from '@industry/web';
import { CategorySheet } from '../../components/CategorySheet/CategorySheet';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { colorVariable } from '../../domain/appearance';
import { categoriesOfKind } from '../../domain/category';
import type { Category } from '../../domain/category';
import { setCategoryArchived } from '../../services/categoriesService';

type SheetState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; category: Category };

interface CategoryListProps {
  title: string;
  categories: Category[];
  onEdit: (category: Category) => void;
  onToggleArchived: (category: Category) => void;
}

function CategoryList({ title, categories, onEdit, onToggleArchived }: CategoryListProps) {
  if (categories.length === 0) return null;

  return (
    <section aria-label={title}>
      <h3 style={{ fontSize: 'var(--text-h5)' }}>{title}</h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {categories.map((category) => {
          const archiveLabel = category.archived ? 'Desarquivar' : 'Arquivar';
          return (
            <li
              key={category.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-divider)',
              }}
            >
              <Icon
                name={category.icon as IconName}
                size="sm"
                color={colorVariable(category.color)}
              />
              <span style={{ flex: 1, minWidth: 0 }}>{category.name}</span>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Editar ${category.name}`}
                onClick={() => onEdit(category)}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${archiveLabel} ${category.name}`}
                onClick={() => onToggleArchived(category)}
              >
                {archiveLabel}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function CategoriesSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { categories } = useUserData();
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' });

  async function toggleArchived(category: Category) {
    if (!user) return;
    try {
      await setCategoryArchived(user.uid, category.id, !category.archived);
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  const listProps = {
    onEdit: (category: Category) => setSheet({ mode: 'edit', category }),
    onToggleArchived: toggleArchived,
  };
  const archived = categories
    .filter((category) => category.archived)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-h4)' }}>Categorias</h2>
        <Button size="sm" variant="secondary" onClick={() => setSheet({ mode: 'create' })}>
          Nova categoria
        </Button>
      </div>
      <CategoryList
        title="Categorias de despesa"
        categories={categoriesOfKind(categories, 'expense')}
        {...listProps}
      />
      <CategoryList
        title="Categorias de receita"
        categories={categoriesOfKind(categories, 'income')}
        {...listProps}
      />
      <CategoryList title="Categorias arquivadas" categories={archived} {...listProps} />
      {sheet.mode !== 'closed' ? (
        <CategorySheet
          category={sheet.mode === 'edit' ? sheet.category : undefined}
          onClose={() => setSheet({ mode: 'closed' })}
        />
      ) : null}
    </section>
  );
}
