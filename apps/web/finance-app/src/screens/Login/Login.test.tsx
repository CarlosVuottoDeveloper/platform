import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loginWithGoogle } from '../../services/authService';
import { mockSignedInAs, renderWithProviders, testUser } from '../../test-utils';
import { Login } from './Login';

jest.mock('../../services/authService');

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignedInAs(null);
  });

  it('offers Google sign-in and shows the privacy notice with the contact e-mail', () => {
    renderWithProviders(<Login />);

    expect(screen.getByRole('button', { name: 'Continuar com Google' })).toBeInTheDocument();
    expect(screen.getByText(/não são compartilhados com mais ninguém/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'kaduvuotto@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:kaduvuotto@gmail.com',
    );
  });

  it('starts the Google sign-in when the button is pressed', async () => {
    jest.mocked(loginWithGoogle).mockResolvedValue(testUser);
    renderWithProviders(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'Continuar com Google' }));

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('tells the user when sign-in fails', async () => {
    jest.mocked(loginWithGoogle).mockRejectedValue({ code: 'auth/network-request-failed' });
    renderWithProviders(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'Continuar com Google' }));

    expect(
      await screen.findByText('Não foi possível entrar. Tente novamente.'),
    ).toBeInTheDocument();
  });

  it('shows no error when the popup is closed', async () => {
    jest.mocked(loginWithGoogle).mockResolvedValue(null);
    renderWithProviders(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'Continuar com Google' }));

    expect(screen.queryByText('Não foi possível entrar. Tente novamente.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar com Google' })).toBeEnabled();
  });
});
