import { FirebaseError } from 'firebase/app';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor } from '../../test-utils';
import { login, loginWithGoogle } from '../../services/authService';
import type { AuthStackParamList } from '../../navigation/types';
import { Login } from './Login';

jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
}));

const mockedLogin = login as jest.Mock;
const mockedLoginWithGoogle = loginWithGoogle as jest.Mock;

type LoginProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const mockNavigation = { navigate: jest.fn() } as unknown as LoginProps['navigation'];
const mockRoute = { key: 'Login', name: 'Login' } as unknown as LoginProps['route'];

const ASYNC_TIMEOUT = { timeout: 30000 };

describe('Login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password fields and the submit button', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByTestId('login-email-input')).toBeTruthy();
    expect(screen.getByTestId('login-password-input')).toBeTruthy();
    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  it('updates email and password as the user types', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'secret123');

    expect(emailInput.props.value).toBe('user@example.com');
    expect(passwordInput.props.value).toBe('secret123');
  });

  it('does not show a loading indicator until a submission is made', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('does not call login when submitting with empty fields', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Entrar'));

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('calls authService.login with the typed credentials on submit', async () => {
    mockedLogin.mockResolvedValue({ uid: 'abc123', email: 'user@example.com' });
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'secret123');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith('user@example.com', 'secret123');
    });
  });

  it('navigates to Register when "Criar conta com e-mail" is pressed', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Criar conta com e-mail'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });

  it('navigates to ForgotPassword when "Esqueceu a senha?" is pressed', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Esqueceu a senha?'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('shows a loading indicator while the login request is in flight', async () => {
    let resolveLogin: (value: { uid: string; email: string }) => void = () => {};
    mockedLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'secret123');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    resolveLogin({ uid: 'abc123', email: 'user@example.com' });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('shows a friendly error message when login fails', async () => {
    mockedLogin.mockRejectedValue(new FirebaseError('auth/wrong-password', ''));
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'wrong');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha incorretos.')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('hides the loading indicator after a failed login', async () => {
    mockedLogin.mockRejectedValue(new FirebaseError('auth/wrong-password', ''));
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'wrong');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('renders the Google sign-in button without a caption', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Continuar com Google')).toBeTruthy();
    expect(screen.queryByText(/cria sua conta/)).toBeNull();
  });

  it('separates the e-mail form from the Google button with an "ou" divider', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('ou')).toBeTruthy();
  });

  it('shows the app name as the centered title', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('AppointMate')).toBeTruthy();
    expect(screen.queryByText('Entrar na sua conta')).toBeNull();
    expect(screen.getByText('Acompanhamento de consultas')).toBeTruthy();
  });

  it('offers e-mail sign-up as a link for first-time users', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Primeira vez?')).toBeTruthy();
    expect(screen.getByText('Criar conta com e-mail')).toBeTruthy();
    expect(screen.queryByText('Criar conta')).toBeNull();
  });

  it('places the e-mail fields, then "Entrar", then the Google button', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    const order = screen
      .getByTestId('login-form')
      .props.children.map((child: { props?: { testID?: string } } | null) => child?.props?.testID);
    expect(order.indexOf('login-email-input')).toBeLessThan(order.indexOf('login-submit-button'));
    expect(order.indexOf('login-submit-button')).toBeLessThan(order.indexOf('login-google-button'));
  });

  it('calls authService.loginWithGoogle when the Google button is pressed', async () => {
    mockedLoginWithGoogle.mockResolvedValue({ uid: 'abc123', email: 'user@example.com' });
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Continuar com Google'));

    await waitFor(() => {
      expect(mockedLoginWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  it('shows a loading indicator while the Google sign-in is in flight', async () => {
    let resolveLogin: (value: { uid: string; email: string }) => void = () => {};
    mockedLoginWithGoogle.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Continuar com Google'));

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    resolveLogin({ uid: 'abc123', email: 'user@example.com' });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('stays quiet when the user cancels the Google prompt', async () => {
    mockedLoginWithGoogle.mockResolvedValue(null);
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Continuar com Google'));

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
    expect(screen.queryByText(/erro/i)).toBeNull();
  }, 40000);

  it('shows a friendly error message when the Google sign-in fails', async () => {
    mockedLoginWithGoogle.mockRejectedValue(
      new FirebaseError('auth/account-exists-with-different-credential', ''),
    );
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Continuar com Google'));

    await waitFor(() => {
      expect(
        screen.getByText('Este e-mail já está cadastrado com outro método de login.'),
      ).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 40000);
});
