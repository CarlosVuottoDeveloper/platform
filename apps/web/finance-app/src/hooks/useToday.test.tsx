import { act, render, screen } from '@testing-library/react';
import { useToday } from './useToday';

function Today() {
  return <span>{useToday()}</span>;
}

describe('useToday', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('gives the local calendar day', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 15, 12));

    render(<Today />);

    expect(screen.getByText('2026-03-15')).toBeInTheDocument();
  });

  it('moves to the next day when midnight passes with the app open', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 31, 23, 59, 30));
    render(<Today />);
    expect(screen.getByText('2026-03-31')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(31_000);
    });

    expect(screen.getByText('2026-04-01')).toBeInTheDocument();
  });

  it('keeps following later midnights and stops when unmounted', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 2, 31, 23, 59, 30));
    const { unmount } = render(<Today />);

    act(() => {
      jest.advanceTimersByTime(31_000);
    });
    act(() => {
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
    });
    expect(screen.getByText('2026-04-02')).toBeInTheDocument();

    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
