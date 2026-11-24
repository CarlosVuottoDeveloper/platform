import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { space } from '@industry/tokens';
import { ToastProvider, useToast } from './ToastProvider';

describe('useToast', () => {
  it('throws when used outside a ToastProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useToast();
      } catch (e) {
        return e as Error;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
  });
});

describe('ToastProvider', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  function Trigger({ title, description }: { title: string; description?: string }) {
    const toast = useToast();
    return (
      <Text testID="trigger" onPress={() => toast.show({ title, description })}>
        Disparar
      </Text>
    );
  }

  it('does not re-run a consumer effect that depends on useToast when a toast shows', () => {
    const effectRuns = jest.fn();
    function Watcher() {
      const toast = useToast();
      useEffect(() => effectRuns(), [toast]);
      return (
        <Text testID="watch" onPress={() => toast.show({ title: 'Oi' })}>
          Disparar
        </Text>
      );
    }
    render(
      <ToastProvider>
        <Watcher />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('watch'));

    expect(screen.getByText('Oi')).toBeTruthy();
    expect(effectRuns).toHaveBeenCalledTimes(1);
  });

  it('shows a toast with the given title', () => {
    render(
      <ToastProvider>
        <Trigger title="Salvo com sucesso" />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('trigger'));

    expect(screen.getByText('Salvo com sucesso')).toBeTruthy();
  });

  it('shows the description alongside the title', () => {
    render(
      <ToastProvider>
        <Trigger title="Erro" description="Tente novamente" />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('trigger'));

    expect(screen.getByText('Tente novamente')).toBeTruthy();
  });

  it('auto-dismisses after the default duration', () => {
    render(
      <ToastProvider>
        <Trigger title="Salvo com sucesso" />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('trigger'));
    expect(screen.getByText('Salvo com sucesso')).toBeTruthy();

    act(() => jest.advanceTimersByTime(4000));

    expect(screen.queryByText('Salvo com sucesso')).toBeNull();
  });

  it('dismisses when its own dismiss button is pressed', () => {
    render(
      <ToastProvider>
        <Trigger title="Salvo com sucesso" />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('trigger'));
    fireEvent.press(screen.getByLabelText('Dispensar'));

    expect(screen.queryByText('Salvo com sucesso')).toBeNull();
  });

  it('queues a 4th toast until one of the first 3 is dismissed', () => {
    function MultiTrigger() {
      const toast = useToast();
      return (
        <Text
          testID="trigger"
          onPress={() => {
            toast.show({ title: 'Um' });
            toast.show({ title: 'Dois' });
            toast.show({ title: 'Três' });
            toast.show({ title: 'Quatro' });
          }}
        >
          Disparar
        </Text>
      );
    }

    render(
      <ToastProvider>
        <MultiTrigger />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('trigger'));

    expect(screen.getByText('Um')).toBeTruthy();
    expect(screen.getByText('Dois')).toBeTruthy();
    expect(screen.getByText('Três')).toBeTruthy();
    expect(screen.queryByText('Quatro')).toBeNull();

    fireEvent.press(screen.getAllByLabelText('Dispensar')[0] as never);

    expect(screen.getByText('Quatro')).toBeTruthy();
  });

  it('clears pending timers on unmount', () => {
    const { unmount } = render(
      <ToastProvider>
        <Trigger title="Salvo com sucesso" />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('trigger'));
    unmount();

    expect(() => act(() => jest.advanceTimersByTime(4000))).not.toThrow();
  });

  it('pushes the toast stack below the top safe-area inset using a spacing token', () => {
    render(
      <ToastProvider>
        <Trigger title="Salvo com sucesso" />
      </ToastProvider>,
    );

    const style = [screen.getByTestId('toast-stack').props.style].flat();
    const paddingTop = style.reduce((found, s) => found ?? s?.paddingTop, undefined);

    expect(paddingTop).toBe(space[6]);
  });

  it('respects a custom duration', () => {
    function CustomDurationTrigger() {
      const toast = useToast();
      return (
        <Text testID="trigger" onPress={() => toast.show({ title: 'Rápido', duration: 1000 })}>
          Disparar
        </Text>
      );
    }

    render(
      <ToastProvider>
        <CustomDurationTrigger />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByTestId('trigger'));
    act(() => jest.advanceTimersByTime(1000));

    expect(screen.queryByText('Rápido')).toBeNull();
  });
});
