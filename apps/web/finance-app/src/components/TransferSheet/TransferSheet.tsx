import { Controller, useForm } from 'react-hook-form';
import { Select, TextField } from '@industry/web';
import { useSignedInUser } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import type { Account } from '../../domain/account';
import { isCalendarDate, toCalendarDate } from '../../domain/calendarDate';
import type { Cents } from '../../domain/money';
import { createTransaction } from '../../services/transactionsService';
import { FormSheet } from '../FormSheet/FormSheet';
import { MoneyField } from '../MoneyField/MoneyField';

interface TransferFormValues {
  accountId: string;
  toAccountId: string;
  amountCents: Cents | null;
  date: string;
  description: string;
}

interface TransferSheetProps {
  accounts: Account[];
  onClose: () => void;
}

export function TransferSheet({ accounts, onClose }: TransferSheetProps) {
  const user = useSignedInUser();
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<TransferFormValues>({
    defaultValues: {
      accountId: accounts[0]?.id ?? '',
      toAccountId: accounts[1]?.id ?? '',
      amountCents: null,
      date: toCalendarDate(new Date()),
      description: '',
    },
  });
  const options = accounts.map((account) => ({ value: account.id, label: account.name }));

  function validateDate(date: string) {
    if (!isCalendarDate(date)) return 'Informe a data';
    const { accountId, toAccountId } = getValues();
    const involved = accounts.filter((account) => [accountId, toAccountId].includes(account.id));
    return (
      involved.every((account) => date >= account.openingDate) ||
      'Data anterior à abertura da conta'
    );
  }

  async function save(values: TransferFormValues) {
    if (values.amountCents === null) return;
    try {
      await createTransaction(user.uid, {
        kind: 'transfer',
        amountCents: values.amountCents,
        date: values.date,
        accountId: values.accountId,
        toAccountId: values.toAccountId,
        categoryId: null,
        description: values.description.trim(),
        tags: [],
        recurrenceId: null,
        installment: null,
      });
      onClose();
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  return (
    <FormSheet
      title="Transferência entre contas"
      submitting={isSubmitting}
      onSubmit={handleSubmit(save)}
      onDismiss={onClose}
    >
      <Controller
        control={control}
        name="accountId"
        render={({ field }) => <Select label="Origem" options={options} {...field} />}
      />
      <Controller
        control={control}
        name="toAccountId"
        rules={{
          validate: (value) => value !== getValues('accountId') || 'Escolha contas diferentes',
        }}
        render={({ field, fieldState }) => (
          <Select label="Destino" options={options} error={fieldState.error?.message} {...field} />
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
        name="date"
        rules={{ validate: validateDate }}
        render={({ field, fieldState }) => (
          <TextField label="Data" type="date" error={fieldState.error?.message} {...field} />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField label="Descrição (opcional)" maxLength={140} {...field} />
        )}
      />
    </FormSheet>
  );
}
