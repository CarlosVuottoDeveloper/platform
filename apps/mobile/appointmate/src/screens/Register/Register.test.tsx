import { FirebaseError } from 'firebase/app';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor } from '../../test-utils';
import { register } from '../../services/authService';
import type { AuthStackParamList } from '../../navigation/types';
import { Register } from './Register';

jest.mock('../../services/authService', () => ({
  register: jest.fn(),
}));

const mockedRegister = register as jest.Mock;

type RegisterProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as unknown as RegisterProps['navigation'];
const mockRoute = { key: 'Register', name: 'Register' } as unknown as RegisterProps['route'];

const ASYNC_TIMEOUT = { timeout: 30000 };

function fillValidForm() {
  fireEvent.changeText(screen.getByTestId('register-name-input'), 'Ada Lovelace');
  fireEvent.changeText(screen.getByTestId('register-email-input'), 'user@example.com');
  fireEvent.changeText(screen.getByTestId('register-password-input'), 'secret123');
}

describe('Register', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders name, email and password fields and the submit button', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByTestId('register-name-input')).toBeTruthy();
    expect(screen.getByTestId('register-email-input')).toBeTruthy();
    expect(screen.getByTestId('register-password-input')).toBeTruthy();
    expect(screen.getByText('Cadastrar')).toBeTruthy();
  });

  it('updates name, email and password as the user types', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fillValidForm();

    expect(screen.getByTestId('register-name-input').props.value).toBe('Ada Lovelace');
    expect(screen.getByTestId('register-email-input').props.value).toBe('user@example.com');
    expect(screen.getByTestId('register-password-input').props.value).toBe('secret123');
  });

  it('does not call register when submitting with an empty form', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Cadastrar'));

    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('shows an inline error for an invalid email', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('register-email-input'), 'not-an-email');

    expect(screen.getByText('Formato de e-mail inválido')).toBeTruthy();
  });

  it('shows an inline error for a password shorter than 8 characters', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('register-password-input'), 'abc12');

    expect(screen.getByText('Mínimo de 8 caracteres')).toBeTruthy();
  });

  it('does not call register when the email is invalid', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('register-name-input'), 'Ada Lovelace');
    fireEvent.changeText(screen.getByTestId('register-email-input'), 'not-an-email');
    fireEvent.changeText(screen.getByTestId('register-password-input'), 'secret123');
    fireEvent.press(screen.getByText('Cadastrar'));

    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('does not call register when the password is too short', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('register-name-input'), 'Ada Lovelace');
    fireEvent.changeText(screen.getByTestId('register-email-input'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('register-password-input'), 'abc12');
    fireEvent.press(screen.getByText('Cadastrar'));

    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('calls authService.register with the typed name, email and password on submit', async () => {
    mockedRegister.mockResolvedValue({ uid: 'abc123', email: 'user@example.com' });
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fillValidForm();
    fireEvent.press(screen.getByText('Cadastrar'));

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith('Ada Lovelace', 'user@example.com', 'secret123');
    });
  });

  it('navigates to Login when "Voltar para o login" is pressed', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Voltar para o login'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('shows a loading indicator while the registration request is in flight', async () => {
    let resolveRegister: (value: { uid: string; email: string }) => void = () => {};
    mockedRegister.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve;
        }),
    );
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fillValidForm();
    fireEvent.press(screen.getByText('Cadastrar'));

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    resolveRegister({ uid: 'abc123', email: 'user@example.com' });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('shows a friendly error message when registration fails', async () => {
    mockedRegister.mockRejectedValue(new FirebaseError('auth/email-already-in-use', ''));
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fillValidForm();
    fireEvent.press(screen.getByText('Cadastrar'));

    await waitFor(() => {
      expect(screen.getByText('Este e-mail já está cadastrado.')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('hides the loading indicator after a failed registration', async () => {
    mockedRegister.mockRejectedValue(new FirebaseError('auth/email-already-in-use', ''));
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fillValidForm();
    fireEvent.press(screen.getByText('Cadastrar'));

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('navigates back when the AppBar back button is pressed', () => {
    render(<Register navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByLabelText('Voltar'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
