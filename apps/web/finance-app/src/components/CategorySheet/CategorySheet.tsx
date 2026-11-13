import { Controller, useForm } from 'react-hook-form';
import { Select, TextField } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { COLOR_OPTIONS, ICON_OPTIONS } from '../../domain/appearance';
import type { Category, CategoryInput } from '../../domain/category';
import { createCategory, updateCategory } from '../../services/categoriesService';
import { FormSheet } from '../FormSheet/FormSheet';

interface CategorySheetProps {
  category?: Category;
  onClose: () => void;
}

const KIND_OPTIONS = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
];

export function CategorySheet({ category, onClose }: CategorySheetProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CategoryInput>({
    defaultValues: {
      name: category?.name ?? '',
      kind: category?.kind ?? 'expense',
      color: category?.color ?? 'viz-1',
      icon: category?.icon ?? 'tag',
    },
  });

  async function save(values: CategoryInput) {
    if (!user) return;
    const input = { ...values, name: values.name.trim() };
    try {
      if (category) {
        await updateCategory(user.uid, category.id, input);
      } else {
        await createCategory(user.uid, input);
      }
      onClose();
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  return (
    <FormSheet
      title={category ? 'Editar categoria' : 'Nova categoria'}
      submitting={isSubmitting}
      onSubmit={handleSubmit(save)}
      onDismiss={onClose}
    >
      <Controller
        control={control}
        name="name"
        rules={{ validate: (value) => value.trim() !== '' || 'Informe o nome' }}
        render={({ field, fieldState }) => (
          <TextField label="Nome" maxLength={40} error={fieldState.error?.message} {...field} />
        )}
      />
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <Select label="Tipo" options={KIND_OPTIONS} {...field} disabled={Boolean(category)} />
        )}
      />
      <Controller
        control={control}
        name="color"
        render={({ field }) => <Select label="Cor" options={COLOR_OPTIONS} {...field} />}
      />
      <Controller
        control={control}
        name="icon"
        render={({ field }) => <Select label="Ícone" options={ICON_OPTIONS} {...field} />}
      />
    </FormSheet>
  );
}
