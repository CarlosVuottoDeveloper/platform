import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockSignedInAs, renderWithProviders, testUser } from '../test-utils';
import { useAuth, useSignedInUser } from './AuthContext/AuthContext';
import { ToastProvider, useToast } from './ToastContext/ToastContext';
import { useUserData } from './UserDataContext/UserDataContext';

jest.mock('../services/authService');

function Probe({ hook }: { hook: () => unknown }) {
  hook();
  return null;
}

function expectRenderToThrow(hook: () => unknown, message: string, wrapped = false) {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const renderProbe = () =>
    wrapped ? renderWithProviders(<Probe hook={hook} />) : render(<Probe hook={hook} />);

  expect(renderProbe).toThrow(message);
  consoleError.mockRestore();
}

describe('contexts used outside their providers', () => {
  it('fail loudly instead of rendering with missing data', () => {
    expectRenderToThrow(useAuth, 'useAuth precisa de um AuthProvider');
    expectRenderToThrow(useToast, 'useToast precisa de um ToastProvider');
    expectRenderToThrow(useUserData, 'useUserData precisa de um UserDataProvider');
  });

  it('refuses a signed-in-only screen when nobody is signed in', () => {
    mockSignedInAs(null);

    expectRenderToThrow(useSignedInUser, 'Esta tela exige um usuário autenticado', true);
  });

  it('gives a signed-in-only screen its user', () => {
    mockSignedInAs(testUser);
    function ShowUser() {
      const { loading } = useAuth();
      return loading ? null : <SignedIn />;
    }
    function SignedIn() {
      return <span>{useSignedInUser().email}</span>;
    }

    renderWithProviders(<ShowUser />);

    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
  });
});

describe('ToastProvider', () => {
  function Trigger() {
    const { showToast } = useToast();
    return (
      <button type="button" onClick={() => showToast('danger', 'Algo deu errado')}>
        Disparar
      </button>
    );
  }

  it('shows a message and lets the user dismiss it', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Disparar' }));
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

    const [, dismiss] = screen.getAllByRole('button');
    await userEvent.click(dismiss as HTMLElement);
    expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument();
  });

  it('stacks several messages', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Disparar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Disparar' }));

    expect(screen.getAllByText('Algo deu errado')).toHaveLength(2);
  });
});
