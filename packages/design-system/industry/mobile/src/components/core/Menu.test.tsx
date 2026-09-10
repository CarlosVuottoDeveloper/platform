import { fireEvent, render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { accentRamp, alpha, color } from '@industry/tokens';
import { Menu, resolveMenuPosition } from './Menu';

function mockMeasureInWindow(x: number, y: number, width: number, height: number) {
  const probe: { current: View | null } = { current: null };
  render(<View ref={probe as never} />);
  const prototype = Object.getPrototypeOf(probe.current);
  return jest
    .spyOn(prototype, 'measureInWindow')
    .mockImplementation(((cb: (x: number, y: number, width: number, height: number) => void) =>
      cb(x, y, width, height)) as never);
}

const ITEMS = [
  { key: 'edit', label: 'Editar', onSelect: jest.fn() },
  { key: 'delete', label: 'Excluir', onSelect: jest.fn(), disabled: true },
];

describe('resolveMenuPosition', () => {
  it('positions the panel below the anchor', () => {
    expect(resolveMenuPosition({ x: 0, y: 100, width: 40, height: 20 }, 400)).toMatchObject({
      top: 124,
    });
  });

  it('right-aligns the panel to the anchor', () => {
    expect(resolveMenuPosition({ x: 300, y: 0, width: 40, height: 20 }, 400)).toMatchObject({
      right: 60,
    });
  });

  it('clamps the right offset to a minimum margin', () => {
    expect(resolveMenuPosition({ x: 390, y: 0, width: 40, height: 20 }, 400)).toMatchObject({
      right: 12,
    });
  });
});

describe('Menu', () => {
  it('is hidden until the trigger is pressed', () => {
    const { queryByTestId } = render(
      <Menu trigger={<Text>Ações</Text>} items={ITEMS} testID="menu" />,
    );

    expect(queryByTestId('menu-panel')).toBeNull();
  });

  it('opens and lists every item when the trigger is pressed', () => {
    const { getByTestId, getByText } = render(
      <Menu trigger={<Text>Ações</Text>} items={ITEMS} testID="menu" />,
    );

    fireEvent.press(getByTestId('menu'));

    expect(getByTestId('menu-panel')).toBeTruthy();
    expect(getByText('Editar')).toBeTruthy();
    expect(getByText('Excluir')).toBeTruthy();
  });

  it('calls onSelect and closes when an item is pressed', () => {
    const onSelect = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <Menu
        trigger={<Text>Ações</Text>}
        items={[{ key: 'edit', label: 'Editar', onSelect }]}
        testID="menu"
      />,
    );

    fireEvent.press(getByTestId('menu'));
    fireEvent.press(getByTestId('menu-item-edit'));

    expect(onSelect).toHaveBeenCalled();
    expect(queryByTestId('menu-panel')).toBeNull();
  });

  it('does not call onSelect for a disabled item', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <Menu
        trigger={<Text>Ações</Text>}
        items={[{ key: 'delete', label: 'Excluir', onSelect, disabled: true }]}
        testID="menu"
      />,
    );

    fireEvent.press(getByTestId('menu'));
    fireEvent.press(getByTestId('menu-item-delete'));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes when the backdrop is pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <Menu trigger={<Text>Ações</Text>} items={ITEMS} testID="menu" />,
    );

    fireEvent.press(getByTestId('menu'));
    fireEvent.press(getByTestId('menu-backdrop'));

    expect(queryByTestId('menu-panel')).toBeNull();
  });

  it('supports controlled open state', () => {
    const onOpenChange = jest.fn();
    const { getByTestId, queryByTestId, rerender } = render(
      <Menu
        trigger={<Text>Ações</Text>}
        items={ITEMS}
        open={false}
        onOpenChange={onOpenChange}
        testID="menu"
      />,
    );

    fireEvent.press(getByTestId('menu'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(queryByTestId('menu-panel')).toBeNull();

    rerender(
      <Menu
        trigger={<Text>Ações</Text>}
        items={ITEMS}
        open={true}
        onOpenChange={onOpenChange}
        testID="menu"
      />,
    );
    expect(getByTestId('menu-panel')).toBeTruthy();
  });

  it('renders with no items', () => {
    const { getByTestId } = render(<Menu trigger={<Text>Ações</Text>} testID="menu" />);

    fireEvent.press(getByTestId('menu'));

    expect(getByTestId('menu-panel')).toBeTruthy();
  });

  it('resolves its position once measureInWindow reports the anchor location', () => {
    const spy = mockMeasureInWindow(0, 100, 40, 20);

    const { getByTestId } = render(
      <Menu trigger={<Text>Ações</Text>} items={ITEMS} testID="menu" />,
    );

    fireEvent.press(getByTestId('menu'));

    expect(getByTestId('menu-panel')).toBeTruthy();
    spy.mockRestore();
  });

  it('closes when the device back gesture requests it', () => {
    const { getByTestId, queryByTestId } = render(
      <Menu trigger={<Text>Ações</Text>} items={ITEMS} testID="menu" />,
    );

    fireEvent.press(getByTestId('menu'));
    fireEvent(getByTestId('menu-backdrop').parent as never, 'requestClose');

    expect(queryByTestId('menu-panel')).toBeNull();
  });

  it('works without a testID', () => {
    const { getByText } = render(
      <Menu trigger={<Text>Ações</Text>} items={[{ label: 'Sem chave', onSelect: jest.fn() }]} />,
    );

    fireEvent.press(getByText('Ações'));

    expect(getByText('Sem chave')).toBeTruthy();
  });

  it('renders the header above the items when provided', () => {
    const { getByTestId, getByText } = render(
      <Menu trigger={<Text>Ações</Text>} header="Período" items={ITEMS} testID="menu" />,
    );

    fireEvent.press(getByTestId('menu'));

    expect(getByText('Período')).toBeTruthy();
  });

  it('does not render a header by default', () => {
    const { getByTestId, queryByText } = render(
      <Menu trigger={<Text>Ações</Text>} items={ITEMS} testID="menu" />,
    );

    fireEvent.press(getByTestId('menu'));

    expect(queryByText('Período')).toBeNull();
  });

  it('shows a checkmark on the selected item and not on the others', () => {
    const { getByTestId } = render(
      <Menu
        trigger={<Text>Ações</Text>}
        items={[
          { key: 'a', label: 'Todos', selected: true },
          { key: 'b', label: 'Últimos 7 dias' },
        ]}
        testID="menu"
      />,
    );

    fireEvent.press(getByTestId('menu'));

    expect(getByTestId('menu-item-a').props.style).toMatchObject({
      backgroundColor: expect.any(String),
    });
    expect(getByTestId('menu-item-b').props.style.backgroundColor).toBe('transparent');
  });

  it('keeps the selected item legible with a translucent accent background and accent text', () => {
    const { getByTestId, getByText } = render(
      <Menu
        trigger={<Text>Ações</Text>}
        items={[
          { key: 'a', label: 'Todos', selected: true },
          { key: 'b', label: 'Últimos 7 dias' },
        ]}
        testID="menu"
      />,
    );

    fireEvent.press(getByTestId('menu'));

    expect(getByTestId('menu-item-a').props.style.backgroundColor).toBe(alpha(color.accent, 22));
    expect(getByText('Todos').props.style.color).toBe(accentRamp['300']);
    expect(getByText('Últimos 7 dias').props.style.color).toBe(color.text);
  });

  it('tints an item darker while pressed', () => {
    const { getByTestId } = render(
      <Menu trigger={<Text>Ações</Text>} items={ITEMS} testID="menu" />,
    );

    fireEvent.press(getByTestId('menu'));
    fireEvent(getByTestId('menu-item-edit'), 'pressIn');

    expect(getByTestId('menu-item-edit').props.style).toMatchObject({
      backgroundColor: expect.any(String),
    });
  });
});
