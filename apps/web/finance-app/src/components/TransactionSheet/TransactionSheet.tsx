import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SegmentedControl, Select, TextField } from '@industry/web';
import { useSignedInUser } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { isCalendarDate, toCalendarDate } from '../../domain/calendarDate';
import type { Category, CategoryKind } from '../../domain/category';
import type { Cents } from '../../domain/money';
import { knownTags } from '../../domain/tag';
import type { Transaction, TransactionInput } from '../../domain/transaction';
import { MAX_INSTALLMENTS, installmentsFrom } from '../../domain/installment';
import {
  createInstallments,
  createTransaction,
  updateTransaction,
  updateTransactions,
} from '../../services/transactionsService';
import { FormSheet } from '../FormSheet/FormSheet';
import { MoneyField } from '../MoneyField/MoneyField';
import { TagsField } from '../TagsField/TagsField';

interface TransactionFormValues {
  kind: CategoryKind;
  amountCents: Cents | null;
  date: string;
  accountId: string;
  categoryId: string;
  description: string;
  tags: string[];
  installmentCount: string;
  editScope: EditScope;
}

type EditScope = 'only' | 'following';

interface TransactionSheetProps {
  transaction?: Transaction;
  onClose: () => void;
}

const KIND_OPTIONS = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
];
const UNSELECTED = { value: '', label: 'Selecione' };
const INSTALLMENT_OPTIONS = Array.from({ length: MAX_INSTALLMENTS }, (_, index) => ({
  value: String(index + 1),
  label: index === 0 ? 'À vista' : `${index + 1}x`,
}));
const EDIT_SCOPE_OPTIONS = [
  { value: 'only', label: 'Só esta parcela' },
  { value: 'following', label: 'Esta e as seguintes' },
];

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'pt-BR');

function selectable<T extends { id: string; name: string; archived: boolean }>(
  items: T[],
  currentId: string | null | undefined,
) {
  return [
    UNSELECTED,
    ...items
      .filter((item) => !item.archived || item.id === currentId)
      .sort(byName)
      .map((item) => ({ value: item.id, label: item.name })),
  ];
}

function initialValues(transaction: Transaction | undefined): TransactionFormValues {
  return {
    kind: transaction?.kind === 'income' ? 'income' : 'expense',
    amountCents: transaction?.amountCents ?? null,
    date: transaction?.date ?? toCalendarDate(new Date()),
    accountId: transaction?.accountId ?? '',
    categoryId: transaction?.categoryId ?? '',
    description: transaction?.description ?? '',
    tags: transaction?.tags ?? [],
    installmentCount: '1',
    editScope: 'only',
  };
}

export function TransactionSheet({ transaction, onClose }: TransactionSheetProps) {
  const user = useSignedInUser();
  const { showToast } = useToast();
  const { accounts, categories, transactions } = useUserData();
  const activeAccounts = accounts.filter((account) => !account.archived);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<TransactionFormValues>({ defaultValues: initialValues(transaction) });
  const kind = watch('kind');
  const onlyAccountId = activeAccounts.length === 1 ? activeAccounts[0]?.id : undefined;

  useEffect(() => {
    if (onlyAccountId && getValues('accountId') === '') setValue('accountId', onlyAccountId);
  }, [onlyAccountId, getValues, setValue]);
  const categoriesOfKind: Category[] = categories.filter((category) => category.kind === kind);
  const followingInstallments = transaction?.installment
    ? installmentsFrom(
        transactions,
        transaction.installment.groupId,
        transaction.installment.index + 1,
      )
    : [];

  function validateDate(date: string) {
    if (!isCalendarDate(date)) return 'Informe a data';
    const account = accounts.find((candidate) => candidate.id === getValues('accountId'));
    return !account || date >= account.openingDate || 'Data anterior à abertura da conta';
  }

  async function persist(uid: string, input: TransactionInput, values: TransactionFormValues) {
    if (!transaction) {
      const count = values.kind === 'expense' ? Number(values.installmentCount) : 1;
      await (count > 1 ? createInstallments(uid, input, count) : createTransaction(uid, input));
      return;
    }
    if (values.editScope === 'only' || followingInstallments.length === 0) {
      await updateTransaction(uid, transaction.id, input);
      return;
    }
    const amountWasEdited = input.amountCents !== transaction.amountCents;
    await updateTransactions(uid, [
      { id: transaction.id, input },
      ...followingInstallments.map((following) => ({
        id: following.id,
        input: {
          ...input,
          amountCents: amountWasEdited ? input.amountCents : following.amountCents,
          date: following.date,
          installment: following.installment,
        },
      })),
    ]);
  }

  async function save(values: TransactionFormValues) {
    if (values.amountCents === null) return;
    const input: TransactionInput = {
      kind: values.kind,
      amountCents: values.amountCents,
      date: values.date,
      accountId: values.accountId,
      toAccountId: null,
      categoryId: values.categoryId,
      description: values.description.trim(),
      tags: values.tags,
      recurrenceId: transaction?.recurrenceId ?? null,
      installment: transaction?.installment ?? null,
    };
    try {
      await persist(user.uid, input, values);
      onClose();
    } catch {
      showToast('danger', 'Não foi possível salvar.');
    }
  }

  return (
    <FormSheet
      title={transaction ? 'Editar movimentação' : 'Nova movimentação'}
      submitting={isSubmitting}
      onSubmit={handleSubmit(save)}
      onDismiss={onClose}
    >
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <SegmentedControl
            name="kind"
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
        name="date"
        rules={{ validate: validateDate }}
        render={({ field, fieldState }) => (
          <TextField label="Data" type="date" error={fieldState.error?.message} {...field} />
        )}
      />
      <Controller
        control={control}
        name="accountId"
        rules={{ required: 'Escolha a conta' }}
        render={({ field, fieldState }) => (
          <Select
            label="Conta"
            options={selectable(accounts, transaction?.accountId)}
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
            options={selectable(categoriesOfKind, transaction?.categoryId)}
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />
      {!transaction && kind === 'expense' ? (
        <Controller
          control={control}
          name="installmentCount"
          render={({ field }) => (
            <Select label="Parcelar em" options={INSTALLMENT_OPTIONS} {...field} />
          )}
        />
      ) : null}
      {followingInstallments.length > 0 ? (
        <Controller
          control={control}
          name="editScope"
          render={({ field }) => (
            <Select label="Aplicar a" options={EDIT_SCOPE_OPTIONS} {...field} />
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField label="Descrição (opcional)" maxLength={140} {...field} />
        )}
      />
      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <TagsField
            value={field.value}
            onChange={field.onChange}
            suggestions={knownTags(transactions)}
          />
        )}
      />
    </FormSheet>
  );
}
