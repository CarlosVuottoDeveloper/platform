import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
import { color, radii } from '@industry/tokens';
import { Accordion } from './Accordion';

const ITEMS = [
  { key: 'a', title: 'Item A', content: 'Conteúdo A' },
  { key: 'b', title: 'Item B', content: 'Conteúdo B' },
  { key: 'c', title: 'Item C', content: 'Conteúdo C', disabled: true },
];

describe('Accordion', () => {
  it('renders nothing when there are no items', () => {
    render(<Accordion testID="acc" />);
    expect(screen.getByTestId('acc').children).toHaveLength(0);
  });

  it('renders every item title, collapsed by default', () => {
    render(<Accordion items={ITEMS} testID="acc" />);

    expect(screen.getByText('Item A')).toBeTruthy();
    expect(screen.getByText('Item B')).toBeTruthy();
    expect(screen.getByTestId('acc-a').props.accessibilityState).toMatchObject({ expanded: false });
    expect(screen.queryByTestId('acc-a-panel')).toBeNull();
  });

  it('opens an item when its header is pressed', () => {
    render(<Accordion items={ITEMS} testID="acc" />);

    fireEvent.press(screen.getByTestId('acc-a'));

    expect(screen.getByTestId('acc-a').props.accessibilityState).toMatchObject({ expanded: true });
    expect(screen.getByText('Conteúdo A')).toBeTruthy();
  });

  it('closes an open item when its header is pressed again', () => {
    render(<Accordion items={ITEMS} defaultOpenKeys={['a']} testID="acc" />);
    expect(screen.getByTestId('acc-a-panel')).toBeTruthy();

    fireEvent.press(screen.getByTestId('acc-a'));

    expect(screen.queryByTestId('acc-a-panel')).toBeNull();
  });

  it('closes the previously open item when opening another (single mode)', () => {
    render(<Accordion items={ITEMS} defaultOpenKeys={['a']} testID="acc" />);

    fireEvent.press(screen.getByTestId('acc-b'));

    expect(screen.queryByTestId('acc-a-panel')).toBeNull();
    expect(screen.getByTestId('acc-b-panel')).toBeTruthy();
  });

  it('keeps multiple items open when multiple is set', () => {
    render(<Accordion items={ITEMS} multiple defaultOpenKeys={['a']} testID="acc" />);

    fireEvent.press(screen.getByTestId('acc-b'));

    expect(screen.getByTestId('acc-a-panel')).toBeTruthy();
    expect(screen.getByTestId('acc-b-panel')).toBeTruthy();
  });

  it('does not toggle a disabled item', () => {
    render(<Accordion items={ITEMS} testID="acc" />);

    fireEvent.press(screen.getByTestId('acc-c'));

    expect(screen.queryByTestId('acc-c-panel')).toBeNull();
  });

  it('supports controlled open keys via onOpenKeysChange', () => {
    const onOpenKeysChange = jest.fn();
    const { rerender } = render(
      <Accordion items={ITEMS} openKeys={[]} onOpenKeysChange={onOpenKeysChange} testID="acc" />,
    );

    fireEvent.press(screen.getByTestId('acc-a'));
    expect(onOpenKeysChange).toHaveBeenCalledWith(['a']);
    expect(screen.queryByTestId('acc-a-panel')).toBeNull();

    rerender(
      <Accordion items={ITEMS} openKeys={['a']} onOpenKeysChange={onOpenKeysChange} testID="acc" />,
    );
    expect(screen.getByTestId('acc-a-panel')).toBeTruthy();
  });

  it('renders a non-string title/content node as-is', () => {
    const items = [
      { key: 'x', title: <Text>Título custom</Text>, content: <Text>Conteúdo custom</Text> },
    ];
    render(<Accordion items={items} defaultOpenKeys={['x']} testID="acc" />);

    expect(screen.getByText('Título custom')).toBeTruthy();
    expect(screen.getByText('Conteúdo custom')).toBeTruthy();
  });

  it('works without a testID', () => {
    render(<Accordion items={ITEMS} defaultOpenKeys={['a']} />);
    expect(screen.getByText('Conteúdo A')).toBeTruthy();
  });

  it('is a rounded surface with divider-colored separators', () => {
    render(<Accordion items={ITEMS} testID="acc" />);

    const style = StyleSheet.flatten(screen.getByTestId('acc').props.style);
    expect(style.borderRadius).toBe(radii.md);
    expect(style.backgroundColor).toBe(color.surface);
    expect(style.overflow).toBe('hidden');
    const root = screen.toJSON() as ReactTestRendererJSON;
    const section = root.children?.[0] as ReactTestRendererJSON;
    expect(StyleSheet.flatten(section.props.style).borderColor).toBe(color.divider);
  });
});
