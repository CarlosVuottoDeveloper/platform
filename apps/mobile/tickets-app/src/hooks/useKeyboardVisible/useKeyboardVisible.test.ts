import { act, renderHook } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { useKeyboardVisible } from './useKeyboardVisible';

type Listener = () => void;
const listeners: Record<string, Listener[]> = {};
const removeShow = jest.fn();
const removeHide = jest.fn();

jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => {
  const mockKeyboard = {
    addListener: jest.fn(),
    isVisible: jest.fn(() => false),
    dismiss: jest.fn(),
  };
  return { ...mockKeyboard, default: mockKeyboard, __esModule: true };
});

const mockAddListener = Keyboard.addListener as jest.Mock;

function emit(event: string) {
  act(() => {
    (listeners[event] ?? []).forEach((listener) => listener());
  });
}

describe('useKeyboardVisible', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(listeners).forEach((key) => delete listeners[key]);
    mockAddListener.mockImplementation((event: string, listener: Listener) => {
      (listeners[event] ??= []).push(listener);
      return { remove: event === 'keyboardDidShow' ? removeShow : removeHide };
    });
  });

  it('starts hidden', () => {
    const { result } = renderHook(() => useKeyboardVisible());

    expect(result.current).toBe(false);
  });

  it('turns visible on keyboardDidShow and hidden again on keyboardDidHide', () => {
    const { result } = renderHook(() => useKeyboardVisible());

    emit('keyboardDidShow');
    expect(result.current).toBe(true);

    emit('keyboardDidHide');
    expect(result.current).toBe(false);
  });

  it('removes both listeners on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardVisible());

    unmount();

    expect(removeShow).toHaveBeenCalledTimes(1);
    expect(removeHide).toHaveBeenCalledTimes(1);
  });
});
