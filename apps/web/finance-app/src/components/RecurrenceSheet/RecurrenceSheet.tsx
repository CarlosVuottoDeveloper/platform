import { Controller, useForm } from 'react-hook-form';
import { SegmentedControl, Select, TextField } from '@industry/web';
import { useSignedInUser } from '../../context/AuthContext/AuthContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { dateInMonth, toCalendarDate, yearMonthOf } from '../../domain/calendarDate';
import type { CategoryKind } from '../../domain/category';
import type { Cents } from '../../domain/money';
import type { Recurrence, RecurrenceInput } from '../../domain/recurrence';
import { createRecurrence, updateRecurrence } from '../../services/recurrencesService';
import { useSubmitWrite } from '../../hooks/useSubmitWrite';
import { FormSheet } from '../FormSheet/FormSheet';
import { MoneyField } from '../MoneyField/MoneyField';

interface RecurrenceFormValues {
  kind: CategoryKind;
  amountCents: Cents | null;
  dayOfMonth: string;
  accountId: string;
  categoryId: string;
  description: string;
  startMonth: string;
  endMonth: string;
}

interface RecurrenceSheetProps {
  recurrence?: Recurrence;
  onClose: () => void;
}

const KIND_OPTIONS = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
];
const UNSELECTED = { value: '', label: 'Selecione' };
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function selectable(
  items: { id: string; name: string; archived: boolean }[],
  currentId: string | undefined,
) {
  return [
    UNSELECTED,
    ...items
      .filter((item) => !item.archived || item.id === currentId)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .map((item) => ({ value: item.id, label: item.name })),
  ];
}

function isValidDay(text: string): boolean {
  const day = Number(text);
  return Number.isInteger(day) && day >= 1 && day <= 31;
}

export function RecurrenceSheet({ recurrence, onClose }: RecurrenceSheetProps) {
  const user = useSignedInUser();
  const submit = useSubmitWrite(onClose);
  const { accounts, categories } = useUserData();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<RecurrenceFormValues>({
    defaultValues: {
      kind: recurrence?.kind ?? 'expense',
      amountCents: recurrence?.amountCents ?? null,
      dayOfMonth: String(recurrence?.dayOfMonth ?? 1),
      accountId: recurrence?.accountId ?? '',
      categoryId: recurrence?.categoryId ?? '',
      description: recurrence?.description ?? '',
      startMonth: recurrence?.startMonth ?? yearMonthOf(toCalendarDate(new Date())),
      endMonth: recurrence?.endMonth ?? '',
    },
  });
  const kind = watch('kind');

  function validateStartMonth(startMonth: string) {
    if (!YEAR_MONTH.test(startMonth)) return 'Informe o mês de início';
    const { accountId, dayOfMonth } = getValues();
    const account = accounts.find((candidate) => candidate.id === accountId);
    if (!account || !isValidDay(dayOfMonth)) return true;
    return (
      dateInMonth(startMonth, Number(dayOfMonth)) >= account.openingDate ||
      'O primeiro lançamento seria antes da abertura da conta'
    );
  }

  async function save(values: RecurrenceFormValues) {
    if (values.amountCents === null) return;
    const input: RecurrenceInput = {
      kind: values.kind,
      amountCents: values.amountCents,
      dayOfMonth: Number(values.dayOfMonth),
      accountId: values.accountId,
      categoryId: values.categoryId,
      description: values.description.trim(),
      tags: recurrence?.tags ?? [],
      startMonth: values.startMonth,
      endMonth: values.endMonth === '' ? null : values.endMonth,
    };
    await submit(async () => {
      if (recurrence) {
        await updateRecurrence(user.uid, recurrence.id, input);
      } else {
        await createRecurrence(user.uid, input);
      }
    });
  }

  return (
    <FormSheet
      title={recurrence ? 'Editar recorrente' : 'Nova recorrente'}
      submitting={isSubmitting}
      onSubmit={handleSubmit(save)}
      onDismiss={onClose}
    >
      {recurrence ? (
        <p style={{ margin: 0, fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
          Vale para os próximos lançamentos.
        </p>
      ) : null}
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <SegmentedControl
            name="recurrence-kind"
            options={KIND_OPTIONS}
            value={field.value}
            onChange={(event) => {
              field.onChange(event.target.value);
              setValue('categoryId', '');
            }}
          />
        )}
      />
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
        name="dayOfMonth"
        rules={{ validate: (value) => isValidDay(value) || 'Informe um dia entre 1 e 31' }}
        render={({ field, fieldState }) => (
          <TextField
            label="Dia do mês"
            inputMode="numeric"
            hint="Em meses mais curtos, cai no último dia."
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="accountId"
        rules={{ required: 'Escolha a conta' }}
        render={({ field, fieldState }) => (
          <Select
            label="Conta"
            options={selectable(accounts, recurrence?.accountId)}
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="categoryId"
        rules={{ required: 'Escolha a categoria' }}
        render={({ field, fieldState }) => (
          <Select
            label="Categoria"
            options={selectable(
              categories.filter((category) => category.kind === kind),
              recurrence?.categoryId,
            )}
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField label="Descrição (opcional)" maxLength={140} {...field} />
        )}
      />
      <Controller
        control={control}
        name="startMonth"
        rules={{ validate: validateStartMonth }}
        render={({ field, fieldState }) => (
          <TextField
            label="Início"
            type="month"
            placeholder="AAAA-MM"
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="endMonth"
        rules={{
          validate: (value) =>
            value === '' ||
            (YEAR_MONTH.test(value) && value >= getValues('startMonth')) ||
            'O fim não pode ser antes do início',
        }}
        render={({ field, fieldState }) => (
          <TextField
            label="Fim (opcional)"
            type="month"
            placeholder="AAAA-MM"
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />
    </FormSheet>
  );
}
