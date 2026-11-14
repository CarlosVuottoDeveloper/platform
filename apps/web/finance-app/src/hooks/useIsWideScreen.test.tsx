import { act, render, screen } from '@testing-library/react';
import { useIsWideScreen } from './useIsWideScreen';

function Probe() {
  return <span>{useIsWideScreen() ? 'larga' : 'estreita'}</span>;
}

describe('useIsWideScreen', () => {
  const original = window.matchMedia;

  afterEach(() => {
    window.matchMedia = original;
  });

  it('follows the screen when it is resized across the breakpoint, and stops listening when unmounted', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    const removeEventListener = jest.fn();
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_type: string, handler: (event: MediaQueryListEvent) => void) => {
        listener = handler;
      },
      removeEventListener,
    })) as unknown as typeof window.matchMedia;

    const { unmount } = render(<Probe />);
    expect(screen.getByText('estreita')).toBeInTheDocument();

    act(() => listener?.({ matches: true } as MediaQueryListEvent));
    expect(screen.getByText('larga')).toBeInTheDocument();

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', listener);
  });
});
