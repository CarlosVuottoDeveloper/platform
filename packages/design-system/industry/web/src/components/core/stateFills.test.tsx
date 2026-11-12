import { act, renderHook } from '@testing-library/react';
import { usePressState } from './stateFills';

describe('usePressState', () => {
  it('tracks hover and press through its handlers', () => {
    const { result } = renderHook(() => usePressState());

    act(() => result.current.handlers.onMouseEnter());
    act(() => result.current.handlers.onMouseDown());
    expect(result.current.hovered).toBe(true);
    expect(result.current.pressed).toBe(true);

    act(() => result.current.handlers.onMouseUp());
    expect(result.current.pressed).toBe(false);

    act(() => result.current.handlers.onMouseDown());
    act(() => result.current.handlers.onMouseLeave());
    expect(result.current.hovered).toBe(false);
    expect(result.current.pressed).toBe(false);
  });

  it('clears both flags when disabled flips to true and keeps them cleared on re-enable', () => {
    const { result, rerender } = renderHook(({ disabled }) => usePressState(disabled), {
      initialProps: { disabled: false },
    });

    act(() => result.current.handlers.onMouseEnter());
    act(() => result.current.handlers.onMouseDown());
    rerender({ disabled: true });
    expect(result.current.hovered).toBe(false);
    expect(result.current.pressed).toBe(false);

    rerender({ disabled: false });
    expect(result.current.hovered).toBe(false);
    expect(result.current.pressed).toBe(false);
  });
});
