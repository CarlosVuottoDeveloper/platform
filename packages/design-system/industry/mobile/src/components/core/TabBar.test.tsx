import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
import { color, control, gradient, neutral, radii } from '@industry/tokens';
import { TabBar } from './TabBar';

const ITEMS = [
  { id: 'home', label: 'Início' },
  { id: 'profile', label: 'Perfil' },
];

describe('TabBar', () => {
  it('renders every item', () => {
    const { getByText } = render(<TabBar items={ITEMS} />);

    expect(getByText('Início')).toBeTruthy();
    expect(getByText('Perfil')).toBeTruthy();
  });

  it('marks the current item as selected and shows its label in the text colour', () => {
    const { getByTestId, getByText } = render(<TabBar items={ITEMS} current="profile" />);

    expect(getByTestId('tabbar-item-profile').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(getByTestId('tabbar-item-home').props.accessibilityState).toMatchObject({
      selected: false,
    });
    expect(getByText('Perfil').props.style).toMatchObject({ color: color.text });
    expect(getByText('Início').props.style).toMatchObject({ color: neutral['400'] });
  });

  it('calls onSelect with the pressed item id', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(<TabBar items={ITEMS} onSelect={onSelect} />);

    fireEvent.press(getByTestId('tabbar-item-profile'));

    expect(onSelect).toHaveBeenCalledWith('profile');
  });

  it('renders an icon and tints it when the item is active', () => {
    const { getByText } = render(
      <TabBar current="home" items={[{ id: 'home', label: 'Início', icon: <Text>icon</Text> }]} />,
    );

    expect(getByText('icon')).toBeTruthy();
  });

  it('falls back to the string label as an id when none is given', () => {
    const { getByTestId } = render(<TabBar items={[{ label: 'Início' }]} current="Início" />);

    expect(getByTestId('tabbar-item-Início').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('renders nothing when no items are given', () => {
    const { queryByRole } = render(<TabBar />);

    expect(queryByRole('tab')).toBeNull();
  });

  it('renders an item without a label', () => {
    const { getByTestId } = render(<TabBar items={[{ id: 'home', icon: <Text>icon</Text> }]} />);

    expect(getByTestId('tabbar-item-home')).toBeTruthy();
  });

  it('draws the surface background with rounded top corners and no outline', () => {
    const { toJSON } = render(<TabBar items={ITEMS} />);

    const bar = StyleSheet.flatten((toJSON() as ReactTestRendererJSON).props.style);
    expect(bar).toMatchObject({
      backgroundColor: color.surface,
      borderTopLeftRadius: radii.lg,
      borderTopRightRadius: radii.lg,
    });
    expect(bar.borderTopWidth).toBeUndefined();
  });

  it('exposes every item as a tab at least as tall as the tap target', () => {
    const { getByTestId } = render(<TabBar items={ITEMS} />);

    const item = getByTestId('tabbar-item-home');
    expect(item.props.accessibilityRole).toBe('tab');
    expect(StyleSheet.flatten(item.props.style).minHeight).toBeGreaterThanOrEqual(control.tap);
  });

  it('puts only the active icon in a glowing primary circle of tap size', () => {
    const { getByTestId, queryByTestId } = render(
      <TabBar
        current="home"
        items={[
          { id: 'home', label: 'Início', icon: <Text>a</Text> },
          { id: 'profile', label: 'Perfil', icon: <Text>b</Text> },
        ]}
      />,
    );

    const surface = StyleSheet.flatten(getByTestId('tabbar-surface-home').props.style);
    expect(surface.experimental_backgroundImage).toContain(gradient.primary.colors[0]);
    expect(surface.boxShadow).toBeDefined();
    expect(queryByTestId('tabbar-surface-profile')).toBeNull();
    for (const id of ['home', 'profile']) {
      expect(StyleSheet.flatten(getByTestId(`tabbar-icon-${id}`).props.style)).toMatchObject({
        width: control.tap,
        height: control.tap,
      });
    }
  });

  it('does not uppercase labels', () => {
    const { getByText } = render(<TabBar items={ITEMS} />);

    expect(StyleSheet.flatten(getByText('Início').props.style).textTransform).toBeUndefined();
  });
});
