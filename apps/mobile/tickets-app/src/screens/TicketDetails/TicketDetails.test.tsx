import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { color } from '@industry/tokens';
import React from 'react';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { ActivityIndicator } from 'react-native';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { useTicketDetails } from '../../hooks/useTicketDetails';
import { useUserList } from '../../hooks/useUserList';
import { useAuthStore } from '../../store/useAuthStore';
import { deleteTicket } from '../../services/ticketService';
import { STATUS_LABELS } from '../../constants/ticketStatus';
import { PRIORITY_LABELS } from '../../constants/ticketPriority';
import type { Comment, Ticket } from '../../domain/ticket';
import type { User } from '../../domain/user';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { TicketDetails } from './TicketDetails';

jest.mock('../../hooks/useTicketDetails');
jest.mock('../../hooks/useUserList');
jest.mock('../../store/useAuthStore');
jest.mock('../../services/ticketService');
jest.mock('../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => {
  const mockKeyboard = {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    isVisible: jest.fn(() => false),
    dismiss: jest.fn(),
  };
  return { ...mockKeyboard, default: mockKeyboard, __esModule: true };
});

const mockUseTicketDetails = useTicketDetails as jest.Mock;
const mockUseUserList = useUserList as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockDeleteTicket = deleteTicket as jest.Mock;

type Props = NativeStackScreenProps<AppStackParamList, 'TicketDetails'>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as unknown as Props['navigation'];

function makeRoute(ticketId: string): Props['route'] {
  return { key: 'TicketDetails', name: 'TicketDetails', params: { ticketId } } as Props['route'];
}

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
  name: 'User',
  role: 'standard',
  workspaceId: 'ws-1',
};

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 't1',
    title: 'Impressora não liga',
    description: 'A impressora do 2º andar não liga.',
    status: 'open',
    priority: 'high',
    creatorId: 'user-1',
    creatorName: 'User',
    createdAt: null,
    assigneeId: null,
    assigneeName: null,
    ...overrides,
  };
}

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'c1',
    text: 'Já verifiquei o cabo de energia.',
    authorId: 'user-1',
    authorName: 'User',
    createdAt: null,
    ...overrides,
  };
}

function mockTicketDetailsReturn(overrides: Partial<ReturnType<typeof useTicketDetails>> = {}) {
  return {
    ticket: makeTicket(),
    comments: [],
    loading: false,
    error: null,
    clearError: jest.fn(),
    addComment: jest.fn().mockResolvedValue(undefined),
    deleteComment: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function setUser(user: User) {
  mockUseAuthStore.mockImplementation((selector: (s: { user: User }) => unknown) =>
    selector({ user }),
  );
}

describe('TicketDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTicketDetails.mockReturnValue(mockTicketDetailsReturn());
    mockUseUserList.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      clearError: jest.fn(),
    });
    mockDeleteTicket.mockResolvedValue(undefined);
    setUser(adminUser);
  });

  it('shows loading indicator while fetching ticket', () => {
    mockUseTicketDetails.mockReturnValue(mockTicketDetailsReturn({ ticket: null, loading: true }));

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows not found message when ticket is null', () => {
    mockUseTicketDetails.mockReturnValue(mockTicketDetailsReturn({ ticket: null, loading: false }));

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.getByText('Chamado não encontrado.')).toBeTruthy();
  });

  it('renders ticket title, description and metadata', () => {
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({
        ticket: makeTicket({
          title: 'Impressora não liga',
          description: 'A impressora do 2º andar não liga.',
          creatorName: 'Bruna',
        }),
      }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.getByText('Impressora não liga')).toBeTruthy();
    expect(screen.getByText('A impressora do 2º andar não liga.')).toBeTruthy();
    expect(screen.getByText('Criador')).toBeTruthy();
    expect(screen.getByText('Bruna')).toBeTruthy();
  });

  it('renders status and priority badges', () => {
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({
        ticket: makeTicket({ status: 'in_progress', priority: 'high' }),
      }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.getByText(STATUS_LABELS.in_progress)).toBeTruthy();
    expect(screen.getByText(PRIORITY_LABELS.high)).toBeTruthy();
  });

  it('renders comments list', () => {
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({
        comments: [
          makeComment({ id: 'c1', text: 'Primeiro comentário', authorName: 'Bruna' }),
          makeComment({ id: 'c2', text: 'Segundo comentário', authorName: 'Caio' }),
        ],
      }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.getByText('Primeiro comentário')).toBeTruthy();
    expect(screen.getByText('Segundo comentário')).toBeTruthy();
  });

  it('admin can enter edit mode via header button', () => {
    setUser(adminUser);
    mockUseTicketDetails.mockReturnValue(mockTicketDetailsReturn({ comments: [] }));

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.getByText('não designado')).toBeTruthy();
    expect(screen.queryByLabelText('Confirmar edição')).toBeNull();

    fireEvent.press(screen.getByLabelText('Editar chamado'));

    expect(screen.getByLabelText('Confirmar edição')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
  });

  it('renders the confirm action as a solid icon button and hairlines under each section', () => {
    setUser(adminUser);
    mockUseTicketDetails.mockReturnValue(mockTicketDetailsReturn({ comments: [] }));

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    fireEvent.press(screen.getByLabelText('Editar chamado'));

    const confirm = screen.getByLabelText('Confirmar edição');
    expect(StyleSheet.flatten(confirm.props.style).backgroundColor).toBe(color.accent);
    expect(screen.getAllByTestId('ticket-details-section-hairline')).toHaveLength(3);
  });

  it('keeps the comment bar out of the scroll content', () => {
    setUser(adminUser);
    mockUseTicketDetails.mockReturnValue(mockTicketDetailsReturn({ comments: [] }));

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.getByTestId('ticket-details-comment-bar')).toBeTruthy();
    expect(
      screen.UNSAFE_getByType(ScrollView).findAllByProps({ testID: 'ticket-details-comment-bar' }),
    ).toHaveLength(0);
  });

  it('navigates back when the AppBar back button is pressed', () => {
    setUser(adminUser);
    mockUseTicketDetails.mockReturnValue(mockTicketDetailsReturn({ comments: [] }));

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    fireEvent.press(screen.getByLabelText('Voltar'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('summarizes the pending changes as "from → to" rows before saving', () => {
    setUser(adminUser);
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({ ticket: makeTicket({ status: 'open', priority: 'medium' }) }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    fireEvent.press(screen.getByLabelText('Editar chamado'));
    fireEvent.press(screen.getByText('Concluído'));
    fireEvent.press(screen.getByLabelText('Confirmar edição'));

    expect(screen.getByText('Salvar alterações')).toBeTruthy();
    expect(screen.getByText('Aberto → Concluído')).toBeTruthy();
    expect(screen.getByText('Média → Média')).toBeTruthy();
  });

  it('admin can delete ticket via header button', async () => {
    setUser(adminUser);
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({ ticket: makeTicket({ id: 't1' }), comments: [] }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(mockDeleteTicket).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText('Apagar chamado'));

    expect(screen.getByText('Apagar ticket')).toBeTruthy();
    expect(mockDeleteTicket).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Apagar'));

    await waitFor(() => {
      expect(mockDeleteTicket).toHaveBeenCalledWith('t1', 'ws-1');
    });
    await waitFor(() => {
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('standard user does not see the admin header edit/delete button', () => {
    setUser(standardUser);
    mockUseTicketDetails.mockReturnValue(mockTicketDetailsReturn({ comments: [] }));

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.queryByLabelText('Editar chamado')).toBeNull();
    expect(screen.queryByLabelText('Apagar chamado')).toBeNull();
  });

  it('user can add a comment', async () => {
    const mockAddComment = jest.fn().mockResolvedValue(undefined);
    setUser(standardUser);
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({ comments: [], addComment: mockAddComment }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Escrever um comentário'),
      'Novo comentário de teste',
    );
    fireEvent.press(screen.getByLabelText('Enviar comentário'));

    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith('Novo comentário de teste');
    });
  });

  it('cancels ticket deletion without calling deleteTicket', () => {
    setUser(adminUser);
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({ ticket: makeTicket({ id: 't1' }), comments: [] }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    fireEvent.press(screen.getByLabelText('Apagar chamado'));
    expect(screen.getByText('Apagar ticket')).toBeTruthy();

    fireEvent.press(screen.getByText('Cancelar'));

    expect(screen.queryByText('Apagar ticket')).toBeNull();
    expect(mockDeleteTicket).not.toHaveBeenCalled();
  });

  it('dismisses the delete-ticket sheet when the backdrop is pressed', () => {
    setUser(adminUser);
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({ ticket: makeTicket({ id: 't1' }), comments: [] }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    fireEvent.press(screen.getByLabelText('Apagar chamado'));
    expect(screen.getByText('Apagar ticket')).toBeTruthy();

    fireEvent.press(screen.getByTestId('delete-ticket-sheet-backdrop'));

    expect(screen.queryByText('Apagar ticket')).toBeNull();
    expect(mockDeleteTicket).not.toHaveBeenCalled();
  });

  it('shows a toast and clears mutation errors when the hook reports one', () => {
    const clearError = jest.fn();
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({ error: 'Falha ao carregar chamado', clearError }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(screen.getByText('Falha ao carregar chamado')).toBeTruthy();
    expect(clearError).toHaveBeenCalled();
  });

  it('updates the draft assignee while editing', async () => {
    setUser(adminUser);
    mockUseUserList.mockReturnValue({
      users: [
        {
          uid: 'u2',
          email: 'alice@test.com',
          name: 'Alice',
          role: 'standard',
          workspaceId: 'ws-1',
        },
      ],
      loading: false,
      error: null,
      clearError: jest.fn(),
    });
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({ ticket: makeTicket({ id: 't1' }), comments: [] }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    fireEvent.press(screen.getByLabelText('Editar chamado'));
    fireEvent.press(screen.getByText('não designado'));
    fireEvent.press(await screen.findByText('Alice'));

    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.queryByText('não designado')).toBeNull();
  });

  it('user can delete own comment', async () => {
    const mockDeleteComment = jest.fn().mockResolvedValue(undefined);
    setUser(standardUser);
    mockUseTicketDetails.mockReturnValue(
      mockTicketDetailsReturn({
        comments: [makeComment({ id: 'c1', authorId: standardUser.uid })],
        deleteComment: mockDeleteComment,
      }),
    );

    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    fireEvent.press(screen.getByLabelText('Apagar comentário'));

    expect(screen.getByText('Apagar comentário')).toBeTruthy();
    expect(mockDeleteComment).not.toHaveBeenCalled();

    const confirmButtons = screen.getAllByText('Apagar');
    const dialogConfirmButton = confirmButtons[confirmButtons.length - 1];
    if (!dialogConfirmButton) throw new Error('Delete comment dialog confirm button not found');
    fireEvent.press(dialogConfirmButton);

    await waitFor(() => {
      expect(mockDeleteComment).toHaveBeenCalledWith('c1');
    });
  });

  it('lets the keyboard avoiding view measure the keyboard itself, without a vertical offset', () => {
    render(<TicketDetails navigation={mockNavigation} route={makeRoute('t1')} />);

    expect(
      screen.UNSAFE_getByType(KeyboardAvoidingView).props.keyboardVerticalOffset,
    ).toBeUndefined();
  });
});
