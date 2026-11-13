import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from './context/AuthContext/AuthContext';
import { ToastProvider } from './context/ToastContext/ToastContext';
import { UserDataProvider } from './context/UserDataContext/UserDataContext';
import type { Account } from './domain/account';
import type { Budget } from './domain/budget';
import type { Category } from './domain/category';
import type { Recurrence } from './domain/recurrence';
import type { Transaction } from './domain/transaction';
import { subscribeToAccounts } from './services/accountsService';
import type { AuthUser } from './services/authService';
import { subscribeToBudgets } from './services/budgetsService';
import { seedDefaultCategories, subscribeToCategories } from './services/categoriesService';
import { materializeDueRecurrences, subscribeToRecurrences } from './services/recurrencesService';
import { subscribeToTransactions } from './services/transactionsService';
import { subscribeToAuthChanges } from './services/authService';

export const testUser: AuthUser = {
  uid: 'user-1',
  displayName: 'Ana Teste',
  email: 'ana@example.com',
  photoURL: null,
};

export function mockSignedInAs(user: AuthUser | null) {
  jest.mocked(subscribeToAuthChanges).mockImplementation((onChange) => {
    onChange(user);
    return jest.fn();
  });
}

export function mockWideScreen(isWide: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: isWide,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as typeof window.matchMedia;
}

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>{ui}</AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

export function renderSignedIn(ui: ReactElement, options: { route?: string } = {}) {
  return renderWithProviders(<UserDataProvider>{ui}</UserDataProvider>, options);
}

export function money(expected: string) {
  return (content: string) => content.replace(/\s/g, ' ') === expected;
}

interface UserDataFixture {
  accounts?: Account[];
  budgets?: Budget[];
  categories?: Category[];
  recurrences?: Recurrence[];
  transactions?: Transaction[];
}

function publish<T>(items: T[]) {
  return (_uid: string, onChange: (items: T[]) => void) => {
    onChange(items);
    return jest.fn();
  };
}

export function mockUserData(data: UserDataFixture = {}) {
  jest.mocked(seedDefaultCategories).mockResolvedValue();
  jest.mocked(materializeDueRecurrences).mockResolvedValue();
  jest.mocked(subscribeToAccounts).mockImplementation(publish(data.accounts ?? []));
  jest.mocked(subscribeToBudgets).mockImplementation(publish(data.budgets ?? []));
  jest.mocked(subscribeToCategories).mockImplementation(publish(data.categories ?? []));
  jest.mocked(subscribeToRecurrences).mockImplementation(publish(data.recurrences ?? []));
  jest.mocked(subscribeToTransactions).mockImplementation(publish(data.transactions ?? []));
}
