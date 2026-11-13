import { Controller, useForm } from 'react-hook-form';
import { TextField } from '@industry/web';
import { useSignedInUser } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { isCalendarDate } from '../../domain/calendarDate';
import type { Goal } from '../../domain/goal';
import type { Cents } from '../../domain/money';
import { createGoal, updateGoal } from '../../services/goalsService';
import { FormSheet } from '../FormSheet/FormSheet';
import { MoneyField } from '../MoneyField/MoneyField';

interface GoalFormValues {
  name: string;
  targetCents: Cents | null;
  deadline: string;
}

interface GoalSheetProps {
  goal?: Goal;
  onClose: () => void;
}

export function GoalSheet({ goal, onClose }: GoalSheetProps) {
  const user = useSignedInUser();
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<GoalFormValues>({
    defaultValues: {
      name: goal?.name ?? '',
      targetCents: goal?.targetCents ?? null,
      deadline: goal?.deadline ?? '',
    },
  });

  async function save(values: GoalFormValues) {
    if (!user || values.targetCents === null) return;
    const input = {
      name: values.name.trim(),
      targetCents: values.targetCents,
      deadline: values.deadline === '' ? null : values.deadline,
    };
    try {
      if (goal) {
        await updateGoal(user.uid, goal.id, input);
      } else {
        await createGoal(user.uid, input);
      }
      onClose();
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  return (
    <FormSheet
      title={goal ? 'Editar meta' : 'Nova meta'}
      submitting={isSubmitting}
      onSubmit={handleSubmit(save)}
      onDismiss={onClose}
    >
      <Controller
        control={control}
        name="name"
        rules={{ validate: (value) => value.trim() !== '' || 'Informe o nome' }}
        render={({ field, fieldState }) => (
          <TextField label="Nome" maxLength={60} error={fieldState.error?.message} {...field} />
        )}
      />
      <Controller
        control={control}
        name="targetCents"
        rules={{ validate: (value) => (value !== null && value > 0) || 'Informe o valor alvo' }}
        render={({ field, fieldState }) => (
          <MoneyField
            label="Valor alvo"
            value={field.value}
            error={fieldState.error?.message}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="deadline"
        rules={{ validate: (value) => value === '' || isCalendarDate(value) || 'Data inválida' }}
        render={({ field, fieldState }) => (
          <TextField
            label="Prazo (opcional)"
            type="date"
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />
    </FormSheet>
  );
}
