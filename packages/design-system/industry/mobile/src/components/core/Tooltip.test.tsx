import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text, View } from 'react-native';
import { color, radii } from '@industry/tokens';
import { Tooltip, resolveTooltipSide } from './Tooltip';
import type { TooltipSide } from './Tooltip';

function mockMeasureInWindow(x: number, y: number, width: number, height: number) {
  const probe: { current: View | null } = { current: null };
  render(<View ref={probe as never} />);
  const prototype = Object.getPrototypeOf(probe.current);
  return jest
    .spyOn(prototype, 'measureInWindow')
    .mockImplementation(((cb: (x: number, y: number, width: number, height: number) => void) =>
      cb(x, y, width, height)) as never);
}

const WINDOW = { width: 400, height: 800 };

describe('resolveTooltipSide', () => {
  it.each<[TooltipSide, { x: number; y: number; width: number; height: number }, TooltipSide]>([
    ['top', { x: 0, y: 100, width: 40, height: 20 }, 'top'],
    ['top', { x: 0, y: 10, width: 40, height: 20 }, 'bottom'],
    ['bottom', { x: 0, y: 100, width: 40, height: 20 }, 'bottom'],
    ['bottom', { x: 0, y: 750, width: 40, height: 20 }, 'top'],
    ['left', { x: 100, y: 0, width: 40, height: 20 }, 'left'],
    ['left', { x: 10, y: 0, width: 40, height: 20 }, 'right'],
    ['right', { x: 100, y: 0, width: 40, height: 20 }, 'right'],
    ['right', { x: 380, y: 0, width: 40, height: 20 }, 'left'],
  ])('resolves %s at %o to %s', (side, measurement, expected) => {
    expect(resolveTooltipSide(side, measurement, WINDOW)).toBe(expected);
  });
});

describe('Tooltip', () => {
  it('is hidden until long-pressed', () => {
    const { queryByText } = render(
      <Tooltip label="Excluir" testID="tip">
        <Text>Ação</Text>
      </Tooltip>,
    );

    expect(queryByText('Excluir')).toBeNull();
  });

  it('reveals the label on long press and hides it again on release', () => {
    const { getByTestId, getByText, queryByText } = render(
      <Tooltip label="Excluir" testID="tip">
        <Text>Ação</Text>
      </Tooltip>,
    );
    const trigger = getByTestId('tip');

    fireEvent(trigger, 'longPress');
    expect(getByText('Excluir')).toBeTruthy();

    fireEvent(trigger, 'pressOut');
    expect(queryByText('Excluir')).toBeNull();
  });

  it('renders the trigger content', () => {
    const { getByText } = render(
      <Tooltip label="Excluir">
        <Text>Conteúdo</Text>
      </Tooltip>,
    );

    expect(getByText('Conteúdo')).toBeTruthy();
  });

  it('opens without a testID on the bubble when none is given', () => {
    const { getByText } = render(
      <Tooltip label="Excluir">
        <Text testID="trigger-text">Ação</Text>
      </Tooltip>,
    );

    fireEvent(getByText('Ação').parent as never, 'longPress');

    expect(getByText('Excluir')).toBeTruthy();
  });

  it.each<TooltipSide>(['top', 'bottom', 'left', 'right'])(
    'positions the bubble for side=%s (before any async flip resolves)',
    (side) => {
      const { getByTestId } = render(
        <Tooltip label="Excluir" side={side} testID="tip">
          <Text>Ação</Text>
        </Tooltip>,
      );

      fireEvent(getByTestId('tip'), 'longPress');

      expect(getByTestId('tip-bubble')).toBeTruthy();
    },
  );

  it('resolves the flipped side once measureInWindow reports its position', () => {
    const spy = mockMeasureInWindow(0, 10, 40, 20);

    const { getByTestId } = render(
      <Tooltip label="Excluir" side="top" testID="tip">
        <Text>Ação</Text>
      </Tooltip>,
    );

    fireEvent(getByTestId('tip'), 'longPress');

    expect(getByTestId('tip-bubble')).toBeTruthy();
    spy.mockRestore();
  });

  it('renders the bubble as a rounded surface2 card', () => {
    const { getByTestId } = render(
      <Tooltip label="Excluir" testID="tip">
        <Text>Ação</Text>
      </Tooltip>,
    );

    fireEvent(getByTestId('tip'), 'longPress');

    const style = StyleSheet.flatten(getByTestId('tip-bubble').props.style);
    expect(style.borderRadius).toBe(radii.md);
    expect(style.backgroundColor).toBe(color.surface2);
  });
});
