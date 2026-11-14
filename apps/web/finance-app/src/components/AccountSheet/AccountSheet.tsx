import { Controller, useForm } from 'react-hook-form';
import { Select, TextField } from '@industry/web';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS, isLiability } from '../../domain/account';
import type { Account, AccountInput, AccountType } from '../../domain/account';
import { COLOR_OPTIONS, ICON_OPTIONS } from '../../domain/appearance';
import { earliestTransactionDate } from '../../domain/balance';
import { formatDateBR, isCalendarDate, toCalendarDate } from '../../domain/calendarDate';
import type { Cents } from '../../domain/money';
import { useSignedInUser } from '../../context/AuthContext/AuthContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { createAccount, updateAccount } from '../../services/accountsService';
import { useSubmitWrite } from '../../hooks/useSubmitWrite';
import { FormSheet } from '../FormSheet/FormSheet';
import { MoneyField } from '../MoneyField/MoneyField';

interface AccountFormValues {
  name: string;
  type: AccountType;
  color: string;
  icon: string;
  balance: Cents | null;
  balanceTouched: boolean;
  openingDate: string;
}

interface AccountSheetProps {
  account?: Account;
  onClose: () => void;
}

const TYPE_OPTIONS = ACCOUNT_TYPES.map((type) => ({
  value: type,
  label: ACCOUNT_TYPE_LABELS[type],
}));

function initialValues(account: Account | undefined): AccountFormValues {
  return {
    name: account?.name ?? '',
    type: account?.type ?? 'bank',
    color: account?.color ?? 'viz-1',
    icon: account?.icon ?? 'landmark',
    balance: account ? Math.abs(account.initialBalanceCents) : null,
    balanceTouched: false,
    openingDate: account?.openingDate ?? toCalendarDate(new Date()),
  };
}

function toAccountInput(values: AccountFormValues): AccountInput {
  const balance = values.balance ?? 0;
  return {
    name: values.name.trim(),
    type: values.type,
    color: values.color,
    icon: values.icon,
    initialBalanceCents: isLiability(values.type) && balance !== 0 ? -balance : balance,
    openingDate: values.openingDate,
  };
}

export function AccountSheet({ account, onClose }: AccountSheetProps) {
  const user = useSignedInUser();
  const submit = useSubmitWrite(onClose);
  const { transactions } = useUserData();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<AccountFormValues>({ defaultValues: initialValues(account) });
  const selectedType = watch('type');
  const balanceTouched = watch('balanceTouched');

  function validateOpeningDate(openingDate: string) {
    if (!isCalendarDate(openingDate)) return 'Informe a data de abertura';
    const earliest = account ? earliestTransactionDate(account.id, transactions) : null;
    return (
      earliest === null ||
      openingDate <= earliest ||
      `Há movimentações antes dessa data (a primeira é de ${formatDateBR(earliest)})`
    );
  }

  async function save(values: AccountFormValues) {
    await submit(async () => {
      if (account) {
        await updateAccount(user.uid, account.id, toAccountInput(values));
      } else {
        await createAccount(user.uid, toAccountInput(values));
      }
    });
  }

  return (
    <FormSheet
      title={account ? 'Editar conta' : 'Nova conta'}
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
        name="type"
        render={({ field }) => <Select label="Tipo" options={TYPE_OPTIONS} {...field} />}
      />
      <Controller
        control={control}
        name="balance"
        rules={{ validate: (value) => !balanceTouched || value !== null || 'Valor inválido' }}
        render={({ field, fieldState }) => (
          <MoneyField
            label={isLiability(selectedType) ? 'Saldo devedor inicial' : 'Saldo inicial'}
            value={field.value}
            error={fieldState.error?.message}
            onChange={(cents, text) => {
              field.onChange(cents);
              setValue('balanceTouched', text.trim() !== '');
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="openingDate"
        rules={{ validate: validateOpeningDate }}
        render={({ field, fieldState }) => (
          <TextField
            label="Data de abertura"
            type="date"
            error={fieldState.error?.message}
            {...field}
          />
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
