import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Account } from '../../domain/account';
import type { Budget } from '../../domain/budget';
import { toCalendarDate } from '../../domain/calendarDate';
import type { Category } from '../../domain/category';
import type { Goal } from '../../domain/goal';
import type { Recurrence } from '../../domain/recurrence';
import type { Transaction } from '../../domain/transaction';
import { subscribeToAccounts } from '../../services/accountsService';
import { subscribeToBudgets } from '../../services/budgetsService';
import { seedDefaultCategories, subscribeToCategories } from '../../services/categoriesService';
import { subscribeToGoals } from '../../services/goalsService';
import {
  materializeDueRecurrences,
  subscribeToRecurrences,
} from '../../services/recurrencesService';
import { subscribeToTransactions } from '../../services/transactionsService';
import { useAuth } from '../AuthContext/AuthContext';
import { useToast } from '../ToastContext/ToastContext';

interface UserDataContextValue {
  accounts: Account[];
  budgets: Budget[];
  categories: Category[];
  goals: Goal[];
  recurrences: Recurrence[];
  transactions: Transaction[];
  loading: boolean;
  failed: boolean;
}

type Subscribe<T> = (
  uid: string,
  onChange: (items: T[]) => void,
  onError: (code: string) => void,
) => () => void;

const UserDataContext = createContext<UserDataContextValue | null>(null);

function useUserCollection<T>(subscribe: Subscribe<T>, onFailure: () => void): T[] | null {
  const { user } = useAuth();
  const uid = user?.uid;
  const [items, setItems] = useState<T[] | null>(null);

  useEffect(() => {
    if (!uid) return undefined;
    return subscribe(uid, setItems, onFailure);
  }, [uid, subscribe, onFailure]);

  return items;
}

function useDefaultCategoriesSeeding() {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    seedDefaultCategories(uid).catch(() => undefined);
  }, [uid]);
}

function useRecurrenceMaterialization(recurrences: Recurrence[] | null) {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid || !recurrences) return;
    void materializeDueRecurrences(uid, recurrences, toCalendarDate(new Date()));
  }, [uid, recurrences]);
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  useDefaultCategoriesSeeding();
  const { showToast } = useToast();
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => {
    setFailed(true);
    showToast('danger', 'Não foi possível carregar seus dados.');
  }, [showToast]);
  const accounts = useUserCollection(subscribeToAccounts, onFailure);
  const budgets = useUserCollection(subscribeToBudgets, onFailure);
  const categories = useUserCollection(subscribeToCategories, onFailure);
  const goals = useUserCollection(subscribeToGoals, onFailure);
  const recurrences = useUserCollection(subscribeToRecurrences, onFailure);
  const transactions = useUserCollection(subscribeToTransactions, onFailure);
  useRecurrenceMaterialization(recurrences);

  const value = useMemo(
    () => ({
      accounts: accounts ?? [],
      budgets: budgets ?? [],
      categories: categories ?? [],
      goals: goals ?? [],
      recurrences: recurrences ?? [],
      transactions: transactions ?? [],
      loading: [accounts, budgets, categories, goals, recurrences, transactions].includes(null),
      failed,
    }),
    [accounts, budgets, categories, failed, goals, recurrences, transactions],
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataContextValue {
  const value = useContext(UserDataContext);
  if (!value) throw new Error('useUserData precisa de um UserDataProvider');
  return value;
}
