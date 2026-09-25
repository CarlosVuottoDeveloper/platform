import { StyleSheet, Text } from 'react-native';
import { space } from '@industry/tokens';
import { render, screen } from '../../test-utils';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { BottomBar } from './BottomBar';

jest.mock('../../hooks/useKeyboardVisible');
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return { ...actual, useSafeAreaInsets: () => ({ top: 0, bottom: 48, left: 0, right: 0 }) };
});

const mockUseKeyboardVisible = useKeyboardVisible as jest.Mock;

function renderBar() {
  render(
    <BottomBar testID="bottom-bar">
      <Text>Salvar</Text>
    </BottomBar>,
  );
  return StyleSheet.flatten(screen.getByTestId('bottom-bar').props.style);
}

describe('BottomBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKeyboardVisible.mockReturnValue(false);
  });

  it('renders its children', () => {
    renderBar();
    expect(screen.getByText('Salvar')).toBeTruthy();
  });

  it('forwards testID to the container', () => {
    renderBar();
    expect(screen.getByTestId('bottom-bar')).toBeTruthy();
  });

  it('pads the bottom by the safe area while the keyboard is hidden', () => {
    expect(renderBar().paddingBottom).toBe(20 + 48);
  });

  it('keeps only a small gap above the keyboard while it is open', () => {
    mockUseKeyboardVisible.mockReturnValue(true);

    expect(renderBar().paddingBottom).toBe(space[3]);
  });
});
