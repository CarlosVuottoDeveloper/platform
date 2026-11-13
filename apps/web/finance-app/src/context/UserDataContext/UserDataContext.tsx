import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Account } from '../../domain/account';
import type { Transaction } from '../../domain/transaction';
import { subscribeToAccounts } from '../../services/accountsService';
import { subscribeToTransactions } from '../../services/transactionsService';
import { useAuth } from '../AuthContext/AuthContext';
import { useToast } from '../ToastContext/ToastContext';

interface UserDataContextValue {
  accounts: Account[];
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

export function UserDataProvider({ children }: { children: ReactNode }) {
  const accounts = useUserCollection(subscribeToAccounts);
  const transactions = useUserCollection(subscribeToTransactions);

  const value = useMemo(
    () => ({
      accounts: accounts ?? [],
      transactions: transactions ?? [],
      loading: accounts === null || transactions === null,
    }),
    [accounts, transactions],
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataContextValue {
  const value = useContext(UserDataContext);
  if (!value) throw new Error('useUserData precisa de um UserDataProvider');
  return value;
}
