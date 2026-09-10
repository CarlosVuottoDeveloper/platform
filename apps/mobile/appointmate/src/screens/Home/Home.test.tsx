import { RefreshControl } from 'react-native';
import { FirebaseError } from 'firebase/app';
import { space } from '@industry/tokens';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor, within } from '../../test-utils';
import { AuthProvider } from '../../context/AuthContext';
import { logout, subscribeToAuthChanges, type AuthUser } from '../../services/authService';
import { listForms } from '../../services/formsService';
import type { AppStackParamList } from '../../navigation/types';
import { Home } from './Home';

jest.mock('../../services/authService', () => ({
  subscribeToAuthChanges: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../../services/formsService', () => ({
  listForms: jest.fn(),
}));

const mockedSubscribeToAuthChanges = subscribeToAuthChanges as jest.Mock;
const mockedLogout = logout as jest.Mock;

function signedInAs(user: AuthUser | null) {
  mockedSubscribeToAuthChanges.mockImplementation((callback: (u: AuthUser | null) => void) => {
    callback(user);
    return jest.fn();
  });
}

const mockedListForms = listForms as jest.Mock;

type HomeProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

const mockNavigation = {
  navigate: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
} as unknown as HomeProps['navigation'];
const mockRoute = { key: 'Home', name: 'Home' } as unknown as HomeProps['route'];

const ASYNC_TIMEOUT = { timeout: 15000 };

const formA = {
  id: 'form-a',
  appointmentDate: '15/03/2026',
  overallSummary: 'Semana tranquila.',
  status: 'submitted' as const,
  createdAt: new Date(),
  updatedAt: null,
};

const formB = {
  id: 'form-b',
  appointmentDate: '',
  overallSummary: '',
  status: 'draft' as const,
  createdAt: new Date(),
  updatedAt: null,
};

function renderHome() {
  return render(
    <AuthProvider>
      <Home navigation={mockNavigation} route={mockRoute} />
    </AuthProvider>,
  );
}

describe('Home', () => {
  beforeEach(() => {
    signedInAs({ uid: 'user-abc', email: 'user@example.com' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while forms are fetched', () => {
    mockedListForms.mockReturnValue(new Promise(() => {}));

    renderHome();

    expect(screen.getByTestId('home-loading')).toBeTruthy();
  });

  it('shows only skeleton cards while loading, without a spinner or caption', () => {
    mockedListForms.mockReturnValue(new Promise(() => {}));

    renderHome();

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText('Carregando formulários')).toBeNull();
  });

  it('adds breathing room above the first form card', async () => {
    mockedListForms.mockResolvedValue([formA]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-list')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    expect(screen.getByTestId('home-list').props.contentContainerStyle).toMatchObject({
      paddingTop: space[3],
    });
  }, 20000);

  it('shows a full-screen error when the initial load fails', async () => {
    mockedListForms.mockRejectedValue(new Error('network error'));

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-error')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('retries the load when the error action is pressed', async () => {
    mockedListForms.mockRejectedValue(new Error('network error'));

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-error')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    mockedListForms.mockClear();
    mockedListForms.mockResolvedValue([formA]);
    fireEvent.press(screen.getByText('Tentar novamente'));

    await waitFor(() => {
      expect(screen.getByTestId('home-form-card-form-a')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('shows a connectivity-specific message when the load fails offline', async () => {
    mockedListForms.mockRejectedValue(new FirebaseError('unavailable', ''));

    renderHome();

    await waitFor(() => {
      expect(
        screen.getByText('Sem conexão. Verifique sua internet e tente novamente.'),
      ).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('shows an empty state when the user has no forms', async () => {
    mockedListForms.mockResolvedValue([]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-empty-state')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('renders a card for each form', async () => {
    mockedListForms.mockResolvedValue([formA, formB]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-form-card-form-a')).toBeTruthy();
    }, ASYNC_TIMEOUT);
    expect(screen.getByTestId('home-form-card-form-b')).toBeTruthy();
    expect(screen.getByText('15/03/2026')).toBeTruthy();
    expect(screen.getByText('Sem data')).toBeTruthy();
  }, 20000);

  it('navigates to FormDetail when a card is pressed', async () => {
    mockedListForms.mockResolvedValue([formA]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-form-card-form-a')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    fireEvent.press(screen.getByTestId('home-form-card-form-a'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('FormDetail', { formId: 'form-a' });
  }, 20000);

  it('navigates to FormEntry when "Novo formulário" is pressed', async () => {
    mockedListForms.mockResolvedValue([]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-new-form-button')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    fireEvent.press(screen.getByTestId('home-new-form-button'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('FormEntry', undefined);
  }, 20000);

  it('shows a toast when a silent (pull-to-refresh) reload fails', async () => {
    mockedListForms.mockResolvedValue([formA]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-list')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    mockedListForms.mockRejectedValue(new Error('network error'));
    fireEvent(screen.UNSAFE_getByType(RefreshControl), 'refresh');

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar seus formulários.')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('does not fetch forms when there is no signed-in user', () => {
    signedInAs(null);

    renderHome();

    expect(mockedListForms).not.toHaveBeenCalled();
  });

  it('re-fetches the list on pull-to-refresh', async () => {
    mockedListForms.mockResolvedValue([formA]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-list')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    mockedListForms.mockClear();
    mockedListForms.mockResolvedValue([formA, formB]);
    fireEvent(screen.UNSAFE_getByType(RefreshControl), 'refresh');

    await waitFor(() => {
      expect(mockedListForms).toHaveBeenCalledWith('user-abc');
    }, ASYNC_TIMEOUT);
    await waitFor(() => {
      expect(screen.getByTestId('home-form-card-form-b')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('re-fetches the list when the screen regains focus (e.g. after deleting a form elsewhere)', async () => {
    mockedListForms.mockResolvedValue([formA]);

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-form-card-form-a')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    expect(mockNavigation.addListener).toHaveBeenCalledWith('focus', expect.any(Function));
    const focusHandler = (mockNavigation.addListener as jest.Mock).mock.calls
      .filter(([eventName]) => eventName === 'focus')
      .at(-1)?.[1];

    mockedListForms.mockClear();
    mockedListForms.mockResolvedValue([]);
    focusHandler();

    await waitFor(() => {
      expect(mockedListForms).toHaveBeenCalledWith('user-abc');
    }, ASYNC_TIMEOUT);
    await waitFor(() => {
      expect(screen.queryByTestId('home-form-card-form-a')).toBeNull();
    }, ASYNC_TIMEOUT);
  }, 20000);

  describe('header', () => {
    it('shows "Meus formulários" as the header title', async () => {
      mockedListForms.mockResolvedValue([]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByText('Meus formulários')).toBeTruthy();
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('renders a "Sair" action in the header that calls logout when pressed', async () => {
      mockedListForms.mockResolvedValue([]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-logout-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('home-logout-button'));

      expect(mockedLogout).toHaveBeenCalled();
    }, 20000);
  });

  describe('time filter', () => {
    it('opens a menu with the period presets when the filter icon is pressed', async () => {
      mockedListForms.mockResolvedValue([]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-filter-icon-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('home-filter-icon-button'));

      const menu = within(screen.getByTestId('home-filter-menu-panel'));
      expect(menu.getByText('Todos')).toBeTruthy();
      expect(menu.getByText('Últimos 7 dias')).toBeTruthy();
      expect(menu.getByText('Últimos 30 dias')).toBeTruthy();
      expect(screen.queryByText('Personalizado')).toBeNull();
    }, 20000);

    it('filters the list and reloads it when a period is selected', async () => {
      const now = new Date();
      const recent = { ...formA, id: 'form-recent', createdAt: now };
      const old = {
        ...formB,
        id: 'form-old',
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30),
      };
      mockedListForms.mockResolvedValue([recent, old]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-form-card-form-old')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('home-filter-icon-button'));
      mockedListForms.mockClear();
      fireEvent.press(screen.getByText('Últimos 7 dias'));

      await waitFor(() => {
        expect(screen.queryByTestId('home-form-card-form-old')).toBeNull();
      }, ASYNC_TIMEOUT);
      expect(screen.getByTestId('home-form-card-form-recent')).toBeTruthy();
      await waitFor(() => {
        expect(mockedListForms).toHaveBeenCalledWith('user-abc');
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('does not reload the list when the filter menu opens', async () => {
      mockedListForms.mockResolvedValue([formA]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-filter-menu')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      mockedListForms.mockClear();
      fireEvent.press(screen.getByTestId('home-filter-menu'));

      expect(mockedListForms).not.toHaveBeenCalled();
    }, 20000);

    it('reloads the list when the filter menu is dismissed without selecting a period', async () => {
      mockedListForms.mockResolvedValue([formA]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-filter-icon-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('home-filter-icon-button'));
      mockedListForms.mockClear();
      fireEvent.press(screen.getByTestId('home-filter-menu-backdrop'));

      await waitFor(() => {
        expect(mockedListForms).toHaveBeenCalledWith('user-abc');
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('shows the filtered-empty state when the period has no matching forms', async () => {
      const now = new Date();
      const old = {
        ...formA,
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60),
      };
      mockedListForms.mockResolvedValue([old]);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-filter-icon-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('home-filter-icon-button'));
      fireEvent.press(screen.getByText('Últimos 7 dias'));

      await waitFor(() => {
        expect(screen.getByTestId('home-empty-filtered-state')).toBeTruthy();
      }, ASYNC_TIMEOUT);
    }, 20000);
  });
});
