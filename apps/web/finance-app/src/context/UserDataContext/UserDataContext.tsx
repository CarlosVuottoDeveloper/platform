import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Account } from '../../domain/account';
import { subscribeToAccounts } from '../../services/accountsService';
import { useAuth } from '../AuthContext/AuthContext';
import { useToast } from '../ToastContext/ToastContext';

interface UserDataContextValue {
  accounts: Account[];
  loading: boolean;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const uid = user?.uid;
  const [accounts, setAccounts] = useState<Account[] | null>(null);

  useEffect(() => {
    if (!uid) return undefined;
    const onError = () => showToast('danger', 'Não foi possível carregar seus dados.');
    return subscribeToAccounts(uid, setAccounts, onError);
  }, [uid, showToast]);

  const value = useMemo(
    () => ({ accounts: accounts ?? [], loading: accounts === null }),
    [accounts],
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataContextValue {
  const value = useContext(UserDataContext);
  if (!value) throw new Error('useUserData precisa de um UserDataProvider');
  return value;
}
