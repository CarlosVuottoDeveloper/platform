import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from './context/AuthContext/AuthContext';
import { ToastProvider } from './context/ToastContext/ToastContext';
import type { AuthUser } from './services/authService';
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
