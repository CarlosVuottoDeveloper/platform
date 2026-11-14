import { addMonths, dateInMonth, yearMonthOf } from './calendarDate';
import type { Cents } from './money';
import type { Installment, Transaction, TransactionInput } from './transaction';

export const MAX_INSTALLMENTS = 48;

export function splitInstallments(totalCents: Cents, count: number): Cents[] {
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, index) => (index === 0 ? base + remainder : base));
}

export function buildInstallments(
  draft: TransactionInput,
  count: number,
  groupId: string,
): TransactionInput[] {
  const firstMonth = yearMonthOf(draft.date);
  const day = Number(draft.date.slice(8));
  return splitInstallments(draft.amountCents, count).map((amountCents, offset) => ({
    ...draft,
    amountCents,
    date: dateInMonth(addMonths(firstMonth, offset), day),
    installment: { groupId, index: offset + 1, count },
  }));
}

type InstallmentTransaction = Transaction & { installment: Installment };

const isInstallment = (transaction: Transaction): transaction is InstallmentTransaction =>
  transaction.installment !== null;

export function installmentsFrom(
  transactions: Transaction[],
  groupId: string,
  fromIndex: number,
): Transaction[] {
  return transactions
    .filter(isInstallment)
    .filter(
      (transaction) =>
        transaction.installment.groupId === groupId && transaction.installment.index >= fromIndex,
    )
    .sort((a, b) => a.installment.index - b.installment.index);
}
