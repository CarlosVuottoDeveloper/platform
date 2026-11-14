import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loginWithGoogle } from '../../services/authService';
import { mockSignedInAs, mockWideScreen, renderWithProviders, testUser } from '../../test-utils';
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
    expect(
      screen.getByText(/usa o reCAPTCHA do Google para se proteger de abuso/),
    ).toBeInTheDocument();
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

  it('presents the app: brand, headline, tag and what it does', () => {
    renderWithProviders(<Login />);

    expect(within(screen.getByRole('banner')).getByText('Finanças')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Suas finanças em ordem');
    expect(screen.getByText('Controle financeiro pessoal')).toBeInTheDocument();
    for (const feature of ['Contas e saldos', 'Orçamentos com aviso', 'Metas com aportes']) {
      expect(screen.getByRole('heading', { name: feature })).toBeInTheDocument();
    }
  });

  it('also signs in from the header button', async () => {
    jest.mocked(loginWithGoogle).mockResolvedValue(testUser);
    renderWithProviders(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'Entrar com Google' }));

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons while the Google popup is open', async () => {
    let finish: (user: null) => void = () => undefined;
    jest.mocked(loginWithGoogle).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    renderWithProviders(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'Continuar com Google' }));

    expect(screen.getByRole('button', { name: 'Entrar com Google' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continuar com Google' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar com Google' }));
    expect(loginWithGoogle).toHaveBeenCalledTimes(1);

    finish(null);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Entrar com Google' })).toBeEnabled(),
    );
  });

  it('shows the daily spending illustration without announcing it as real data', () => {
    renderWithProviders(<Login />);

    const card = screen.getByRole('region', { name: 'Gastos dia a dia' });
    expect(within(card).getByText('menos')).toBeInTheDocument();
    expect(within(card).getByText('mais')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it.each([
    [true, 'repeat(3, 1fr)'],
    [false, '1fr'],
  ])('lays the feature cards side by side only on a wide screen (wide: %s)', (isWide, columns) => {
    mockWideScreen(isWide);

    renderWithProviders(<Login />);

    expect(screen.getByTestId('feature-cards')).toHaveStyle({ gridTemplateColumns: columns });
  });
});
