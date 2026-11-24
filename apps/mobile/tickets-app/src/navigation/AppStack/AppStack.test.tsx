import { render, screen, fireEvent } from '../../test-utils';
import { subscribeToTicketList } from '../../services/ticketService';
import type { User } from '../../domain/user';
import { AppStack } from './AppStack';

jest.mock('../../services/ticketService');
jest.mock('../../services/authService');
jest.mock('../../services/firebase', () => ({ auth: {}, db: {} }));

const mockLogout = jest.fn();
let mockCurrentUser: User | null = null;

jest.mock('../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: User | null; logout: () => void }) => unknown) =>
    selector({ user: mockCurrentUser, logout: mockLogout }),
}));

const mockSubscribeToTicketList = subscribeToTicketList as jest.Mock;

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

function renderAppStack() {
  const result = render(<AppStack />);
  return {
    ...result,
    safeUnmount: () => {
      try {
        result.unmount();
      } catch {
        return;
      }
    },
  };
}

describe('AppStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = standardUser;
    mockSubscribeToTicketList.mockImplementation((_user: User, onData: (tickets: []) => void) => {
      onData([]);
      return jest.fn();
    });
  });

  it('renders Dashboard as initial route', () => {
    const { safeUnmount } = renderAppStack();

    expect(screen.getByText('Nenhum chamado ainda')).toBeTruthy();

    safeUnmount();
  });

  it('logout button triggers signOut', () => {
    const { safeUnmount } = renderAppStack();

    fireEvent.press(screen.getByLabelText('Sair'));

    expect(screen.getByText('Tem certeza que deseja sair?')).toBeTruthy();

    fireEvent.press(screen.getAllByText('Sair').at(-1)!);

    expect(mockLogout).toHaveBeenCalledTimes(1);

    safeUnmount();
  });

  it('admin user sees CreateUser option', () => {
    mockCurrentUser = adminUser;
    const { safeUnmount } = renderAppStack();

    expect(screen.getByLabelText('Criar usuário')).toBeTruthy();

    safeUnmount();
  });

  it('standard user does not see CreateUser option', () => {
    mockCurrentUser = standardUser;
    const { safeUnmount } = renderAppStack();

    expect(screen.queryByLabelText('Criar usuário')).toBeNull();

    safeUnmount();
  });
});
