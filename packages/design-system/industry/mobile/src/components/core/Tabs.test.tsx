import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import type { ReactTestRendererJSON } from 'react-test-renderer';
import { color, control, gradient, neutral, radii } from '@industry/tokens';
import { Tabs } from './Tabs';

const ITEMS = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'settings', label: 'Configurações' },
];

describe('Tabs', () => {
  it('renders every tab', () => {
    const { getByText } = render(<Tabs items={ITEMS} />);

    expect(getByText('Visão geral')).toBeTruthy();
    expect(getByText('Configurações')).toBeTruthy();
  });

  it('marks the current tab as selected', () => {
    const { getByTestId } = render(<Tabs items={ITEMS} current="settings" />);

    expect(getByTestId('tab-settings').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(getByTestId('tab-overview').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  it('calls onSelect with the pressed tab id', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(<Tabs items={ITEMS} onSelect={onSelect} />);

    fireEvent.press(getByTestId('tab-settings'));

    expect(onSelect).toHaveBeenCalledWith('settings');
  });

  it('renders a count badge when given', () => {
    const { getByText } = render(
      <Tabs items={[{ id: 'activity', label: 'Atividade', count: 3 }]} />,
    );

    expect(getByText('3')).toBeTruthy();
  });

  it('accepts plain string items', () => {
    const { getByText } = render(<Tabs items={['Início']} />);

    expect(getByText('Início')).toBeTruthy();
  });

  it('renders an icon when provided', () => {
    const { getByText } = render(
      <Tabs items={[{ id: 'home', label: 'Início', icon: <Text>icon</Text> }]} />,
    );

    expect(getByText('icon')).toBeTruthy();
  });

  it('renders nothing when no items are given', () => {
    const { queryByRole } = render(<Tabs />);

    expect(queryByRole('tab')).toBeNull();
  });

  it('falls back to the string label as an id when none is given', () => {
    const { getByTestId } = render(<Tabs items={[{ label: 'Início' }]} current="Início" />);

    expect(getByTestId('tab-Início').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('renders a tab without a label', () => {
    const { getByTestId } = render(<Tabs items={[{ id: 'home', icon: <Text>icon</Text> }]} />);

    expect(getByTestId('tab-home')).toBeTruthy();
  });

  it('wraps the tabs in a surface pill', () => {
    const { toJSON } = render(<Tabs items={ITEMS} />);
    const list = toJSON() as ReactTestRendererJSON;

    expect(StyleSheet.flatten(list.props.style)).toMatchObject({
      backgroundColor: color.surface,
      borderRadius: radii.pill,
    });
  });

  it('keeps scrolling horizontally', () => {
    const { toJSON } = render(<Tabs items={ITEMS} />);
    const list = toJSON() as ReactTestRendererJSON;

    expect(list.props.horizontal).toBe(true);
  });

  it('paints only the active tab with the primary gradient and no glow', () => {
    const { getByTestId, queryByTestId } = render(<Tabs items={ITEMS} current="overview" />);

    const style = StyleSheet.flatten(getByTestId('tab-surface-overview').props.style);
    expect(style.experimental_backgroundImage).toContain(gradient.primary.colors[0]);
    expect(style.boxShadow).toBeUndefined();
    expect(queryByTestId('tab-surface-settings')).toBeNull();
  });

  it('shows the active label in the text colour and inactive labels muted', () => {
    const { getByText } = render(<Tabs items={ITEMS} current="overview" />);

    expect(getByText('Visão geral').props.style).toMatchObject({ color: color.text });
    expect(getByText('Configurações').props.style).toMatchObject({ color: neutral['400'] });
  });

  it('makes every tab at least as tall as the tap target', () => {
    const { getByTestId } = render(<Tabs items={ITEMS} />);

    expect(
      StyleSheet.flatten(getByTestId('tab-settings').props.style).minHeight,
    ).toBeGreaterThanOrEqual(control.tap);
  });

  it('draws the count as a pill', () => {
    const { getByText } = render(<Tabs items={[{ id: 'a', label: 'Atividade', count: 3 }]} />);

    expect(StyleSheet.flatten(getByText('3').props.style)).toMatchObject({
      backgroundColor: color.surface2,
      borderRadius: radii.pill,
    });
  });
});
