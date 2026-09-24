import { act, waitFor } from '@testing-library/react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { render, screen, fireEvent } from '../../test-utils';
import { createTicket } from '../../services/ticketService';
import { subscribeToUsers } from '../../services/authService';
import type { User } from '../../domain/user';
import type { AppStackParamList } from '../../navigation/types';
import { NewTicket } from './NewTicket';

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () =>
  jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: jest.fn(),
  })),
);
jest.mock('../../services/ticketService');
jest.mock('../../services/authService');
jest.mock('../../services/firebase', () => ({ auth: {}, db: {} }));

let mockCurrentUser: User | null = null;

jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: User | null }) => unknown) =>
    selector({ user: mockCurrentUser }),
}));

const mockCreateTicket = createTicket as jest.Mock;
const mockSubscribeToUsers = subscribeToUsers as jest.Mock;

type Props = NativeStackScreenProps<AppStackParamList, 'NewTicket'>;

const adminUser: User = {
  uid: 'admin-1',
  email: 'admin@test.com',
  name: 'Admin',
  role: 'admin',
  workspaceId: 'ws-1',
};

const standardUser: User = {
  uid: 'user-1',
  email: 'user@test.com',
  name: 'Bob',
  role: 'standard',
  workspaceId: 'ws-1',
};

const workspaceUsers: User[] = [
  { uid: 'u2', email: 'alice@test.com', name: 'Alice', role: 'standard', workspaceId: 'ws-1' },
];

function renderNewTicket() {
  const goBack = jest.fn();
  const navigation = { goBack, navigate: jest.fn() } as unknown as Props['navigation'];
  const route = {
    key: 'NewTicket',
    name: 'NewTicket',
    params: undefined,
  } as unknown as Props['route'];
  render(<NewTicket navigation={navigation} route={route} />);
  return { goBack };
}

describe('NewTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = standardUser;
    mockSubscribeToUsers.mockImplementation(
      (_workspaceId: string, onData: (users: User[]) => void) => {
        onData(workspaceUsers);
        return jest.fn();
      },
    );
  });

  it('limits the title to 100 characters', () => {
    renderNewTicket();

    expect(screen.getByPlaceholderText('Título do chamado').props.maxLength).toBe(100);
  });

  it('renders title, description and priority fields', () => {
    renderNewTicket();

    expect(screen.getByPlaceholderText('Título do chamado')).toBeTruthy();
    expect(screen.getByPlaceholderText('Descreva o problema...')).toBeTruthy();
    expect(screen.getByText('Prioridade')).toBeTruthy();
  });

  it('shows "Responsável" disabled with an explanatory hint for non-admin users', () => {
    renderNewTicket();

    expect(screen.getByText('Responsável')).toBeTruthy();
    expect(screen.getByText('Somente administradores designam responsável')).toBeTruthy();
  });

  it('shows "Responsável" enabled with no hint for admin users', () => {
    mockCurrentUser = adminUser;
    renderNewTicket();

    expect(screen.getByText('Responsável')).toBeTruthy();
    expect(screen.queryByText('Somente administradores designam responsável')).toBeNull();
  });

  it('disables save button when title is empty', () => {
    renderNewTicket();

    fireEvent.press(screen.getByText('Salvar chamado'));

    expect(mockCreateTicket).not.toHaveBeenCalled();
  });

  it('navigates back when the AppBar back button is pressed', () => {
    const { goBack } = renderNewTicket();

    fireEvent.press(screen.getByLabelText('Voltar'));

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('changes the selected priority', async () => {
    mockCreateTicket.mockResolvedValue(undefined);
    renderNewTicket();

    fireEvent.press(screen.getByText('Média'));
    fireEvent.press(await screen.findByText('Alta'));
    fireEvent.changeText(screen.getByPlaceholderText('Título do chamado'), 'Impressora quebrada');

    await act(async () => {
      fireEvent.press(screen.getByText('Salvar chamado'));
    });

    expect(mockCreateTicket).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'high' }),
      standardUser,
    );
  });

  it('does not create a ticket when there is no signed-in user', () => {
    mockCurrentUser = null;
    renderNewTicket();

    fireEvent.changeText(screen.getByPlaceholderText('Título do chamado'), 'Impressora quebrada');
    fireEvent.press(screen.getByText('Salvar chamado'));

    expect(mockCreateTicket).not.toHaveBeenCalled();
  });

  it('shows error snackbar on ticket creation failure', async () => {
    mockCreateTicket.mockRejectedValue(new Error('Falha de rede'));
    renderNewTicket();

    fireEvent.changeText(screen.getByPlaceholderText('Título do chamado'), 'Impressora quebrada');

    await act(async () => {
      fireEvent.press(screen.getByText('Salvar chamado'));
    });

    expect(screen.getByText('Falha de rede')).toBeTruthy();
  });

  it('navigates back after successful ticket creation without an assignee', async () => {
    mockCreateTicket.mockResolvedValue(undefined);
    const { goBack } = renderNewTicket();

    fireEvent.changeText(screen.getByPlaceholderText('Título do chamado'), 'Impressora quebrada');

    await act(async () => {
      fireEvent.press(screen.getByText('Salvar chamado'));
    });

    expect(mockCreateTicket).toHaveBeenCalledWith(
      {
        title: 'Impressora quebrada',
        description: '',
        priority: 'medium',
        assigneeId: null,
        assigneeName: null,
      },
      standardUser,
    );
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('shows a generic error message when creation fails with a non-Error value', async () => {
    mockCreateTicket.mockRejectedValue('network down');
    renderNewTicket();

    fireEvent.changeText(screen.getByPlaceholderText('Título do chamado'), 'Impressora quebrada');

    await act(async () => {
      fireEvent.press(screen.getByText('Salvar chamado'));
    });

    expect(screen.getByText('Falha ao criar o chamado.')).toBeTruthy();
  });

  it('shows a loading indicator while the request is in flight', async () => {
    let resolveCreateTicket: () => void = () => {};
    mockCreateTicket.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveCreateTicket = resolve;
        }),
    );
    renderNewTicket();

    fireEvent.changeText(screen.getByPlaceholderText('Título do chamado'), 'Impressora quebrada');
    fireEvent.press(screen.getByText('Salvar chamado'));

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    await act(async () => {
      resolveCreateTicket();
    });
  });

  it('creates a ticket with the selected assignee when an admin picks one', async () => {
    mockCurrentUser = adminUser;
    mockCreateTicket.mockResolvedValue(undefined);
    const { goBack } = renderNewTicket();

    fireEvent.press(screen.getByText('Não designado'));
    fireEvent.press(await screen.findByText('Alice'));
    fireEvent.changeText(screen.getByPlaceholderText('Título do chamado'), 'Impressora quebrada');

    await act(async () => {
      fireEvent.press(screen.getByText('Salvar chamado'));
    });

    expect(mockCreateTicket).toHaveBeenCalledWith(
      {
        title: 'Impressora quebrada',
        description: '',
        priority: 'medium',
        assigneeId: 'u2',
        assigneeName: 'Alice',
      },
      adminUser,
    );
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('keeps the form above the keyboard with a keyboard avoiding view', () => {
    renderNewTicket();

    const avoidingView = screen.UNSAFE_getByType(KeyboardAvoidingView);

    expect(avoidingView.props.behavior).toBe(Platform.OS === 'ios' ? 'padding' : 'height');
    expect(avoidingView.props.keyboardVerticalOffset).toBeUndefined();
  });
});
