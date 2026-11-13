import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Account } from '../../domain/account';
import type { Category } from '../../domain/category';
import type { Transaction } from '../../domain/transaction';
import { subscribeToAccounts } from '../../services/accountsService';
import { seedDefaultCategories, subscribeToCategories } from '../../services/categoriesService';
import { subscribeToTransactions } from '../../services/transactionsService';
import { useAuth } from '../AuthContext/AuthContext';
import { useToast } from '../ToastContext/ToastContext';

interface UserDataContextValue {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  loading: boolean;
}

type Subscribe<T> = (
  uid: string,
  onChange: (items: T[]) => void,
  onError: (code: string) => void,
) => () => void;

const UserDataContext = createContext<UserDataContextValue | null>(null);

function useUserCollection<T>(subscribe: Subscribe<T>): T[] | null {
  const { user } = useAuth();
  const { showToast } = useToast();
  const uid = user?.uid;
  const [items, setItems] = useState<T[] | null>(null);

  useEffect(() => {
    if (!uid) return undefined;
    const onError = () => showToast('danger', 'Não foi possível carregar seus dados.');
    return subscribe(uid, setItems, onError);
  }, [uid, showToast, subscribe]);

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

export function UserDataProvider({ children }: { children: ReactNode }) {
  useDefaultCategoriesSeeding();
  const accounts = useUserCollection(subscribeToAccounts);
  const categories = useUserCollection(subscribeToCategories);
  const transactions = useUserCollection(subscribeToTransactions);

  const value = useMemo(
    () => ({
      accounts: accounts ?? [],
      categories: categories ?? [],
      transactions: transactions ?? [],
      loading: accounts === null || categories === null || transactions === null,
    }),
    [accounts, categories, transactions],
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataContextValue {
  const value = useContext(UserDataContext);
  if (!value) throw new Error('useUserData precisa de um UserDataProvider');
  return value;
}
