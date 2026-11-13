import { Controller, useForm } from 'react-hook-form';
import { TextField } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { isCalendarDate, toCalendarDate } from '../../domain/calendarDate';
import type { Goal } from '../../domain/goal';
import type { Cents } from '../../domain/money';
import { addContribution } from '../../services/goalsService';
import { FormSheet } from '../FormSheet/FormSheet';
import { MoneyField } from '../MoneyField/MoneyField';

interface ContributionSheetProps {
  goal: Goal;
  onClose: () => void;
}

export function ContributionSheet({ goal, onClose }: ContributionSheetProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ amountCents: Cents | null; date: string }>({
    defaultValues: { amountCents: null, date: toCalendarDate(new Date()) },
  });

  async function save(values: { amountCents: Cents | null; date: string }) {
    if (!user || values.amountCents === null) return;
    try {
      await addContribution(user.uid, goal.id, {
        amountCents: values.amountCents,
        date: values.date,
      });
      onClose();
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  return (
    <FormSheet
      title={`Aporte em ${goal.name}`}
      submitting={isSubmitting}
      onSubmit={handleSubmit(save)}
      onDismiss={onClose}
    >
      <Controller
        control={control}
        name="amountCents"
        rules={{ validate: (value) => (value !== null && value > 0) || 'Informe o valor' }}
        render={({ field, fieldState }) => (
          <MoneyField
            label="Valor"
            value={field.value}
            error={fieldState.error?.message}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="date"
        rules={{ validate: (value) => isCalendarDate(value) || 'Informe a data' }}
        render={({ field, fieldState }) => (
          <TextField label="Data" type="date" error={fieldState.error?.message} {...field} />
        )}
      />
    </FormSheet>
  );
}
