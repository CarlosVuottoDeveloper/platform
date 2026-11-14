import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logout, subscribeToAuthChanges } from './services/authService';
import { AppRoutes } from './routes';
import { subscribeToAccounts } from './services/accountsService';
import {
  mockSignedInAs,
  mockUserData,
  mockWideScreen,
  renderWithProviders,
  testUser,
} from './test-utils';

jest.mock('./services/authService');
jest.mock('./services/accountsService');
jest.mock('./services/budgetsService');
jest.mock('./services/categoriesService');
jest.mock('./services/goalsService');
jest.mock('./services/recurrencesService');
jest.mock('./services/transactionsService');

const NAV_LABELS = [
  'Painel',
  'Transações',
  'Contas',
  'Orçamentos',
  'Metas',
  'Relatórios',
  'Configurações',
];

describe('AppRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWideScreen(true);
    mockUserData();
  });

  it.each(['/', '/contas', '/relatorios', '/rota-inexistente'])(
    'sends a signed-out visitor from %s to the login screen',
    (route) => {
      mockSignedInAs(null);

      renderWithProviders(<AppRoutes />, { route });

      expect(screen.getByRole('button', { name: 'Continuar com Google' })).toBeInTheDocument();
    },
  );

  it('shows a loading state while the session is being resolved', () => {
    jest.mocked(subscribeToAuthChanges).mockReturnValue(jest.fn());

    renderWithProviders(<AppRoutes />, { route: '/contas' });

    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continuar com Google' })).not.toBeInTheDocument();
  });

  it('sends a signed-in user away from the login screen', () => {
    mockSignedInAs(testUser);

    renderWithProviders(<AppRoutes />, { route: '/login' });

    expect(screen.getByRole('heading', { name: 'Painel' })).toBeInTheDocument();
  });

  it('shows the seven navigation entries in the sidebar on a wide screen', () => {
    mockSignedInAs(testUser);

    renderWithProviders(<AppRoutes />);

    const navigation = screen.getByRole('navigation');
    expect(
      within(navigation)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(NAV_LABELS);
    expect(within(navigation).getByRole('link', { name: 'Painel' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates when a sidebar entry is chosen', async () => {
    mockSignedInAs(testUser);
    renderWithProviders(<AppRoutes />);

    await userEvent.click(screen.getByRole('link', { name: 'Contas' }));

    expect(screen.getByRole('heading', { name: 'Contas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contas' })).toHaveAttribute('aria-current', 'page');
  });

  it('signs out from the sidebar', async () => {
    mockSignedInAs(testUser);
    jest.mocked(logout).mockResolvedValue();
    renderWithProviders(<AppRoutes />);

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('marks sign out and the new movement button with their icons on a wide screen', async () => {
    mockSignedInAs(testUser);
    renderWithProviders(<AppRoutes />);

    const signOut = screen.getByRole('button', { name: 'Sair' });
    const newMovement = screen.getByRole('button', { name: 'Nova movimentação' });
    await waitFor(() => expect(signOut.querySelector('svg')).not.toBeNull());
    await waitFor(() => expect(newMovement.querySelector('svg')).not.toBeNull());
    expect(signOut.style.color).toBe('var(--color-accent-300)');
  });

  it('uses a five-entry bottom tab bar on a narrow screen', async () => {
    mockWideScreen(false);
    mockSignedInAs(testUser);
    renderWithProviders(<AppRoutes />);

    const navigation = screen.getByRole('navigation');
    expect(
      within(navigation)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Painel', 'Transações', 'Contas', 'Orçamentos', 'Mais']);

    await userEvent.click(within(navigation).getByRole('button', { name: 'Contas' }));

    expect(screen.getByRole('heading', { name: 'Contas' })).toBeInTheDocument();
  });

  it('reaches the remaining screens through the "Mais" tab on a narrow screen', async () => {
    mockWideScreen(false);
    mockSignedInAs(testUser);
    renderWithProviders(<AppRoutes />);

    await userEvent.click(screen.getByRole('button', { name: 'Mais' }));
    expect(screen.getByRole('button', { name: 'Mais' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Metas',
      'Relatórios',
      'Configurações',
    ]);

    await userEvent.click(screen.getByRole('link', { name: 'Metas' }));

    expect(screen.getByRole('heading', { name: 'Metas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mais' })).toHaveAttribute('aria-current', 'page');
  });

  it('lets a narrow-screen user sign out from the settings screen', async () => {
    mockWideScreen(false);
    mockSignedInAs(testUser);
    jest.mocked(logout).mockResolvedValue();
    renderWithProviders(<AppRoutes />, { route: '/configuracoes' });

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('sends an unknown route to the dashboard for a signed-in user', () => {
    mockSignedInAs(testUser);

    renderWithProviders(<AppRoutes />, { route: '/rota-inexistente' });

    expect(screen.getByRole('heading', { name: 'Painel' })).toBeInTheDocument();
  });

  it.each([
    ['wide', true],
    ['narrow', false],
  ])('opens the new movement form from any screen on a %s screen', async (_label, isWide) => {
    mockWideScreen(isWide);
    mockSignedInAs(testUser);
    renderWithProviders(<AppRoutes />, { route: '/contas' });

    await userEvent.click(screen.getByRole('button', { name: 'Nova movimentação' }));

    expect(within(screen.getByRole('dialog')).getByText('Nova movimentação')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('waits for the user data instead of showing empty screens', () => {
    mockSignedInAs(testUser);
    jest.mocked(subscribeToAccounts).mockReturnValue(jest.fn());

    renderWithProviders(<AppRoutes />);

    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument();
    expect(screen.queryByText('Comece cadastrando uma conta')).not.toBeInTheDocument();
  });

  it('says so when the user data cannot be loaded and offers to try again', () => {
    mockSignedInAs(testUser);
    jest.mocked(subscribeToAccounts).mockImplementation((_uid, _onChange, onError) => {
      onError('permission-denied');
      return jest.fn();
    });

    renderWithProviders(<AppRoutes />);

    expect(screen.getByText('Não foi possível carregar seus dados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Carregando' })).not.toBeInTheDocument();
  });
});
