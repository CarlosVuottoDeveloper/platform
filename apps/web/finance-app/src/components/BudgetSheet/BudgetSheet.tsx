import { Controller, useForm } from 'react-hook-form';
import { Button } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import type { Budget } from '../../domain/budget';
import type { Category } from '../../domain/category';
import type { Cents } from '../../domain/money';
import { deleteBudget, setBudget } from '../../services/budgetsService';
import { FormSheet } from '../FormSheet/FormSheet';
import { MoneyField } from '../MoneyField/MoneyField';

interface BudgetSheetProps {
  category: Category;
  budget?: Budget;
  onClose: () => void;
}

export function BudgetSheet({ category, budget, onClose }: BudgetSheetProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ limitCents: Cents | null }>({
    defaultValues: { limitCents: budget?.limitCents ?? null },
  });

  async function run(action: (uid: string) => Promise<void>) {
    if (!user) return;
    try {
      await action(user.uid);
      onClose();
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  return (
    <FormSheet
      title={`Teto de ${category.name}`}
      submitting={isSubmitting}
      onSubmit={handleSubmit(({ limitCents }) =>
        run((uid) => setBudget(uid, category.id, limitCents ?? 0)),
      )}
      onDismiss={onClose}
    >
      <Controller
        control={control}
        name="limitCents"
        rules={{ validate: (value) => (value !== null && value > 0) || 'Informe o teto' }}
        render={({ field, fieldState }) => (
          <MoneyField
            label="Teto mensal"
            value={field.value}
            error={fieldState.error?.message}
            onChange={field.onChange}
          />
        )}
      />
      {budget ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => run((uid) => deleteBudget(uid, category.id))}
          style={{ justifySelf: 'start' }}
        >
          Remover teto
        </Button>
      ) : null}
    </FormSheet>
  );
}
