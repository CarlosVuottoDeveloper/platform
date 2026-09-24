import { Card } from '@industry/mobile';
import { color } from '@industry/tokens';
import React from 'react';
import { StyleSheet } from 'react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ActivityIndicator } from 'react-native';
import { render, screen, fireEvent } from '../../test-utils';
import { useTicketList } from '../../hooks/useTicketList';
import { STATUS_LABELS } from '../../constants/ticketStatus';
import { formatDayMonth } from '../../domain/ticket';
import type { Ticket } from '../../domain/ticket';
import type { User } from '../../domain/user';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { Dashboard } from './Dashboard';

jest.mock('../../hooks/useTicketList');
jest.mock('../../services/firebase', () => ({ auth: {}, db: {} }));

let mockCurrentUser: User | null = null;
const mockLogout = jest.fn();

jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: User | null; logout: () => void }) => unknown) =>
    selector({ user: mockCurrentUser, logout: mockLogout }),
}));

const mockUseTicketList = useTicketList as jest.Mock;

const adminUser: User = {
  uid: 'admin-1',
  email: 'admin@test.com',
  name: 'Admin',
  role: 'admin',
  workspaceId: 'ws-1',
};

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

const mockNavigation = {
  navigate: jest.fn(),
} as unknown as Props['navigation'];

const mockRoute = { key: 'Dashboard', name: 'Dashboard', params: undefined } as Props['route'];

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 't1',
    title: 'Impressora não liga',
    description: '',
    status: 'open',
    priority: 'medium',
    creatorId: 'u1',
    creatorName: 'Alice',
    createdAt: null,
    assigneeId: null,
    assigneeName: null,
    ...overrides,
  };
}

function mockTicketListReturn(overrides: Partial<ReturnType<typeof useTicketList>> = {}) {
  return {
    tickets: [],
    loading: false,
    error: null,
    clearError: jest.fn(),
    ...overrides,
  };
}

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = null;
    mockUseTicketList.mockReturnValue(mockTicketListReturn());
  });

  it('shows loading indicator while fetching tickets', () => {
    mockUseTicketList.mockReturnValue(mockTicketListReturn({ loading: true }));

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders pie chart when tickets exist', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({ tickets: [makeTicket({ id: 't1', status: 'open' })] }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getAllByText(STATUS_LABELS.open, { exact: false }).length).toBeGreaterThan(0);
  });

  it('renders recent tickets card with up to 3 tickets', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({
        tickets: [
          makeTicket({ id: 't1', title: 'Chamado 1' }),
          makeTicket({ id: 't2', title: 'Chamado 2' }),
          makeTicket({ id: 't3', title: 'Chamado 3' }),
          makeTicket({ id: 't4', title: 'Chamado 4' }),
        ],
      }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Chamado 1')).toBeTruthy();
    expect(screen.getByText('Chamado 2')).toBeTruthy();
    expect(screen.getByText('Chamado 3')).toBeTruthy();
    expect(screen.queryByText('Chamado 4')).toBeNull();
  });

  it('renders status stat cards for each status', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({
        tickets: [
          makeTicket({ id: 't1', status: 'open' }),
          makeTicket({ id: 't2', status: 'open' }),
          makeTicket({ id: 't3', status: 'in_progress' }),
          makeTicket({ id: 't4', status: 'done' }),
        ],
      }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText(`${STATUS_LABELS.open} · 2`)).toBeTruthy();
    expect(screen.getByText(`${STATUS_LABELS.in_progress} · 1`)).toBeTruthy();
    expect(screen.getByText(`${STATUS_LABELS.done} · 1`)).toBeTruthy();
  });

  it('navigates to TicketList filtered by status on stat card press', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({ tickets: [makeTicket({ id: 't1', status: 'open' })] }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText(`${STATUS_LABELS.open} · 1`));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('TicketList', { status: 'open' });
  });

  it('navigates to NewTicket on FAB press', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({ tickets: [makeTicket({ id: 't1' })] }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityLabel: 'New ticket' }));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('NewTicket');
  });

  it('renders each recent ticket in its own framed card', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({
        tickets: [
          makeTicket({ id: 't1', title: 'Chamado 1' }),
          makeTicket({ id: 't2', title: 'Chamado 2' }),
          makeTicket({ id: 't3', title: 'Chamado 3' }),
          makeTicket({ id: 't4', title: 'Chamado 4' }),
        ],
      }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    const framedCards = screen.UNSAFE_getAllByType(Card).filter((card) => card.props.framed);
    expect(framedCards).toHaveLength(3);
    expect(screen.queryByText('Chamado 4')).toBeNull();
  });

  it('anchors the FAB to the bottom edge when there are tickets', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({ tickets: [makeTicket({ id: 't1' })] }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    const fab = screen.UNSAFE_getByProps({ accessibilityLabel: 'New ticket' });
    const resolved =
      typeof fab.props.style === 'function' ? fab.props.style({ pressed: false }) : fab.props.style;
    expect(StyleSheet.flatten(resolved).bottom).toBeGreaterThan(0);
  });

  it('uses a secondary "Cancelar" in the logout sheet', () => {
    mockUseTicketList.mockReturnValue(mockTicketListReturn({ tickets: [] }));

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByLabelText('Sair'));

    expect(StyleSheet.flatten(screen.getByText('Cancelar').props.style).color).toBe(color.text);
  });

  it('navigates to NewTicket on FAB press from the empty state', () => {
    mockUseTicketList.mockReturnValue(mockTicketListReturn({ tickets: [] }));

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityLabel: 'New ticket' }));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('NewTicket');
  });

  it('renders the creation date of a recent ticket that has one', () => {
    const createdAt = new Date('2026-03-04T15:30:00Z');
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({ tickets: [makeTicket({ title: 'Chamado 1', createdAt })] }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText(`Alice · ${formatDayMonth(createdAt)} · não designado`)).toBeTruthy();
  });

  it('navigates to NewTicket from the empty state action button', () => {
    mockUseTicketList.mockReturnValue(mockTicketListReturn({ tickets: [] }));

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Abrir o primeiro'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('NewTicket');
  });

  it('navigates to a recent ticket on press', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({ tickets: [makeTicket({ id: 't1', title: 'Chamado 1' })] }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByText('Chamado 1'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('TicketDetails', { ticketId: 't1' });
  });

  it('navigates to the unfiltered TicketList on pie chart press', () => {
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({ tickets: [makeTicket({ id: 't1', status: 'open' })] }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByLabelText('Ver todos os chamados'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('TicketList', {});
  });

  it('shows a toast and clears the error when the hook reports one', () => {
    const clearError = jest.fn();
    mockUseTicketList.mockReturnValue(
      mockTicketListReturn({ error: 'Falha ao carregar chamados', clearError }),
    );

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    expect(screen.getByText('Falha ao carregar chamados')).toBeTruthy();
    expect(clearError).toHaveBeenCalled();
  });

  it('does not show a "Criar usuário" action for non-admin users', () => {
    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    expect(screen.queryByLabelText('Criar usuário')).toBeNull();
  });

  it('navigates to CreateUser when an admin presses "Criar usuário"', () => {
    mockCurrentUser = adminUser;

    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByLabelText('Criar usuário'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateUser');
  });

  it('opens and cancels the logout confirmation sheet', () => {
    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByLabelText('Sair'));
    expect(screen.getByText('Tem certeza que deseja sair?')).toBeTruthy();

    fireEvent.press(screen.getByText('Cancelar'));
    expect(screen.queryByText('Tem certeza que deseja sair?')).toBeNull();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('dismisses the logout sheet when the backdrop is pressed', () => {
    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByLabelText('Sair'));
    expect(screen.getByText('Tem certeza que deseja sair?')).toBeTruthy();

    fireEvent.press(screen.getByTestId('logout-sheet-backdrop'));

    expect(screen.queryByText('Tem certeza que deseja sair?')).toBeNull();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('logs out when the logout confirmation sheet is confirmed', () => {
    render(<Dashboard navigation={mockNavigation} route={mockRoute} />);

    fireEvent.press(screen.getByLabelText('Sair'));
    fireEvent.press(screen.getAllByText('Sair').at(-1)!);

    expect(mockLogout).toHaveBeenCalled();
  });
});
