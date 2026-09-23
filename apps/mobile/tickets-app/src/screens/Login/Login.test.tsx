import { FirebaseError } from 'firebase/app';
import { Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor } from '../../test-utils';
import { login, loginWithGoogle } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import type { User } from '../../domain/user';
import type { AuthStackParamList } from '../../navigation/types';
import { Login } from './Login';

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () =>
  jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: jest.fn(),
  })),
);
jest.mock('../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../services/authService', () => ({
  ...jest.requireActual('../../services/authService'),
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
}));

const mockedLogin = login as jest.Mock;
const mockedLoginWithGoogle = loginWithGoogle as jest.Mock;

type LoginProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const mockNavigation = { navigate: jest.fn() } as unknown as LoginProps['navigation'];
const mockRoute = { key: 'Login', name: 'Login' } as unknown as LoginProps['route'];

const ASYNC_TIMEOUT = { timeout: 30000 };

const mockUser: User = {
  uid: 'abc123',
  email: 'user@example.com',
  name: 'User',
  role: 'standard',
  workspaceId: 'ws-1',
};

describe('Login', () => {
  afterEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('renders email and password fields', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByPlaceholderText('email@exemplo.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Sua senha')).toBeTruthy();
    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  it('does not call login when submitting with empty fields', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Entrar'));

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('calls authService.login with the typed credentials on submit', async () => {
    mockedLogin.mockResolvedValue(mockUser);
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByPlaceholderText('email@exemplo.com'), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'secret123');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith('user@example.com', 'secret123');
    });
  });

  it('shows a loading indicator while the login request is in flight', async () => {
    let resolveLogin: (value: User) => void = () => {};
    mockedLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByPlaceholderText('email@exemplo.com'), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'secret123');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    resolveLogin(mockUser);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('shows error on invalid credentials', async () => {
    mockedLogin.mockRejectedValue(new FirebaseError('auth/wrong-password', ''));
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByPlaceholderText('email@exemplo.com'), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'wrong');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha incorretos.')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('navigates to Register on link press', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Criar conta'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });

  it('navigates to ForgotPassword on link press', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Esqueceu a senha?'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('renders on Android without throwing', () => {
    const originalOS = Platform.OS;
    Platform.OS = 'android';

    expect(() => render(<Login navigation={mockNavigation} route={mockRoute} />)).not.toThrow();

    Platform.OS = originalOS;
  });

  it('renders the Google sign-in button without a caption', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Google')).toBeTruthy();
    expect(screen.queryByText(/workspace novo/)).toBeNull();
  });

  it('separates the e-mail form from the Google button with an "ou" divider', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('ou')).toBeTruthy();
  });

  it('places the e-mail fields, then "Entrar", then the Google button', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    const order = screen
      .getByTestId('login-form')
      .props.children.map((child: { props?: { testID?: string } } | null) => child?.props?.testID);
    expect(order.indexOf('login-email-input')).toBeLessThan(order.indexOf('login-submit-button'));
    expect(order.indexOf('login-submit-button')).toBeLessThan(order.indexOf('login-google-button'));
  });

  it('shows a centered title inviting the user to sign in', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Entrar na sua conta')).toBeTruthy();
    expect(screen.getByText('Gestão de chamados')).toBeTruthy();
  });

  it('offers sign-up as a link in the footer', () => {
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Não tem conta?')).toBeTruthy();
    expect(screen.getByText('Criar conta')).toBeTruthy();
    expect(screen.queryByText('Criar conta abre um workspace novo')).toBeNull();
  });

  it('stores the user returned by authService.loginWithGoogle', async () => {
    mockedLoginWithGoogle.mockResolvedValue(mockUser);
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Google'));

    await waitFor(() => {
      expect(useAuthStore.getState().user).toEqual(mockUser);
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('stays quiet and signed out when the user cancels the Google prompt', async () => {
    mockedLoginWithGoogle.mockResolvedValue(null);
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Google'));

    await waitFor(() => {
      expect(mockedLoginWithGoogle).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(screen.queryByText(/erro/i)).toBeNull();
  }, 40000);

  it('shows a friendly error message when the Google sign-in fails', async () => {
    mockedLoginWithGoogle.mockRejectedValue(
      new FirebaseError('auth/account-exists-with-different-credential', ''),
    );
    render(<Login navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Google'));

    await waitFor(() => {
      expect(
        screen.getByText('Este e-mail já está cadastrado com outro método de login.'),
      ).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 40000);
});
