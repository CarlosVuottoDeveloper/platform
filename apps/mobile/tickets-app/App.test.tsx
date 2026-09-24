import { act, render, screen } from '@testing-library/react-native';
import { Alert, Text } from 'react-native';
import { subscribeToAuthUser } from './src/services/authService';
import type { User } from './src/domain/user';
import App from './App';

jest.mock('./src/services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('./src/services/authService');

function MockAuthStack() {
  return <Text>Login</Text>;
}
function MockAppStack() {
  return <Text>Dashboard</Text>;
}

// App.tsx's own responsibility is picking loading vs. AuthStack vs. AppStack
// from the resolved auth state — stand in for the stacks themselves so this
// file doesn't also need to mock their full descendant dependency tree
// (ticket/user Firestore listeners, etc.).
jest.mock('./src/navigation/AuthStack', () => ({ AuthStack: MockAuthStack }));
jest.mock('./src/navigation/AppStack', () => ({ AppStack: MockAppStack }));

const mockSubscribeToAuthUser = subscribeToAuthUser as jest.Mock;

const ana: User = {
  uid: 'user-1',
  email: 'ana@test.com',
  name: 'Ana',
  role: 'standard',
  workspaceId: 'ws-1',
};

function publishAuthUser(user: User | null) {
  const onChange = mockSubscribeToAuthUser.mock.calls[0]?.[0];
  return act(async () => {
    onChange?.(user);
  });
}

function publishAuthError() {
  const onError = mockSubscribeToAuthUser.mock.calls[0]?.[1];
  return act(async () => {
    onError?.();
  });
}

function renderApp() {
  const result = render(<App />);
  return {
    ...result,
    // react-navigation's internal async effects can throw an AggregateError
    // during RTL's automatic between-test cleanup — see the identical
    // safeUnmount workaround in AppStack.test.tsx.
    safeUnmount: () => {
      try {
        result.unmount();
      } catch {
        // no-op
      }
    },
  };
}

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribeToAuthUser.mockImplementation(() => jest.fn());
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('shows a spinner while resolving the initial auth state', () => {
    const { safeUnmount } = renderApp();
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'progressbar' })).toBeTruthy();
    safeUnmount();
  });

  it('renders the auth stack when there is no signed-in user', async () => {
    const { safeUnmount } = renderApp();

    await publishAuthUser(null);

    expect(screen.getByText('Login')).toBeTruthy();
    safeUnmount();
  });

  it('renders the app stack once the user profile is published', async () => {
    const { safeUnmount } = renderApp();

    await publishAuthUser(ana);

    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.queryByText('Login')).toBeNull();
    safeUnmount();
  });

  it('alerts and stays on the auth stack when the profile fetch fails', async () => {
    const { safeUnmount } = renderApp();

    await publishAuthError();

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro de conexão',
      'Não foi possível carregar seu perfil. Verifique sua conexão e tente novamente.',
    );
    expect(screen.getByText('Login')).toBeTruthy();
    safeUnmount();
  });

  it('unsubscribes from the auth listener on unmount', () => {
    const unsubscribe = jest.fn();
    mockSubscribeToAuthUser.mockImplementation(() => unsubscribe);

    const { safeUnmount } = renderApp();
    safeUnmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
