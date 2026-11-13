import type { CalendarDate } from './calendarDate';
import type { Cents } from './money';

export type AccountType =
  | 'bank'
  | 'digital_wallet'
  | 'cash'
  | 'investment'
  | 'credit_card'
  | 'loan';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Banco',
  digital_wallet: 'Carteira digital',
  cash: 'Dinheiro',
  investment: 'Investimentos',
  credit_card: 'Cartão de crédito',
  loan: 'Dívida/Empréstimo',
};

export const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[];

const LIABILITY_TYPES: AccountType[] = ['credit_card', 'loan'];

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  color: string;
  icon: string;
  initialBalanceCents: Cents;
  openingDate: CalendarDate;
  archived: boolean;
}

export type AccountInput = Omit<Account, 'id' | 'archived'>;

export function isLiability(type: AccountType): boolean {
  return LIABILITY_TYPES.includes(type);
}

export function groupAccounts(accounts: Account[]): {
  assets: Account[];
  liabilities: Account[];
  archived: Account[];
} {
  const sorted = [...accounts].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const active = sorted.filter((account) => !account.archived);
  return {
    assets: active.filter((account) => !isLiability(account.type)),
    liabilities: active.filter((account) => isLiability(account.type)),
    archived: sorted.filter((account) => account.archived),
  };
}
