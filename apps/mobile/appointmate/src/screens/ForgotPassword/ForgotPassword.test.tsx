import { FirebaseError } from 'firebase/app';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor } from '../../test-utils';
import { sendPasswordReset } from '../../services/authService';
import type { AuthStackParamList } from '../../navigation/types';
import { ForgotPassword } from './ForgotPassword';

jest.mock('../../services/authService', () => ({
  sendPasswordReset: jest.fn(),
}));

const mockedSendPasswordReset = sendPasswordReset as jest.Mock;

type ForgotPasswordProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as unknown as ForgotPasswordProps['navigation'];
const mockRoute = {
  key: 'ForgotPassword',
  name: 'ForgotPassword',
} as unknown as ForgotPasswordProps['route'];

const ASYNC_TIMEOUT = { timeout: 30000 };

describe('ForgotPassword', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the email field and the submit button', () => {
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByTestId('forgot-password-email-input')).toBeTruthy();
    expect(screen.getByText('Enviar link')).toBeTruthy();
  });

  it('does not call sendPasswordReset when the email field is empty', () => {
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Enviar link'));

    expect(mockedSendPasswordReset).not.toHaveBeenCalled();
  });

  it('goes straight to the e-mail field, without an intro paragraph', () => {
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    expect(screen.queryByText(/Informe seu e-mail/)).toBeNull();
    expect(screen.getByTestId('forgot-password-email-input')).toBeTruthy();
  });

  it('shows an inline error for an invalid email', () => {
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'not-an-email');

    expect(screen.getByText('Formato de e-mail inválido')).toBeTruthy();
  });

  it('does not call sendPasswordReset when the email is invalid', () => {
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'not-an-email');
    fireEvent.press(screen.getByText('Enviar link'));

    expect(mockedSendPasswordReset).not.toHaveBeenCalled();
  });

  it('calls authService.sendPasswordReset with the typed email on submit', async () => {
    mockedSendPasswordReset.mockResolvedValue(undefined);
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'user@example.com');
    fireEvent.press(screen.getByText('Enviar link'));

    await waitFor(() => {
      expect(mockedSendPasswordReset).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('shows a success message after the email is sent', async () => {
    mockedSendPasswordReset.mockResolvedValue(undefined);
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'user@example.com');
    fireEvent.press(screen.getByText('Enviar link'));

    await waitFor(() => {
      expect(screen.getByText('Link enviado')).toBeTruthy();
      expect(screen.getByText('Verifique a caixa de entrada de user@example.com.')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('shows a friendly error message when sendPasswordReset fails', async () => {
    mockedSendPasswordReset.mockRejectedValue(new FirebaseError('auth/user-not-found', ''));
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'user@example.com');
    fireEvent.press(screen.getByText('Enviar link'));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha incorretos.')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('hides the loading indicator after a failed submission', async () => {
    mockedSendPasswordReset.mockRejectedValue(new FirebaseError('auth/user-not-found', ''));
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    fireEvent.changeText(screen.getByTestId('forgot-password-email-input'), 'user@example.com');
    fireEvent.press(screen.getByText('Enviar link'));

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, ASYNC_TIMEOUT);
  }, 40000);

  it('navigates back when the AppBar back button is pressed', () => {
    render(<ForgotPassword navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByLabelText('Voltar'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
