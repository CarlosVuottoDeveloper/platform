import { StyleSheet, Text } from 'react-native';
import { color, fontSize, fontWeight, radii } from '@industry/tokens';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppBar } from './AppBar';

describe('AppBar', () => {
  it('renders the title', () => {
    render(<AppBar title="Painel" />);
    expect(screen.getByText('Painel')).toBeTruthy();
  });

  it('does not render a back button by default', () => {
    render(<AppBar title="Painel" testID="bar" />);
    expect(screen.queryByTestId('bar-back')).toBeNull();
  });

  it('renders and calls onBackPress when a back button is provided', () => {
    const onBackPress = jest.fn();
    render(<AppBar title="Painel" onBackPress={onBackPress} testID="bar" />);

    fireEvent.press(screen.getByTestId('bar-back'));

    expect(onBackPress).toHaveBeenCalled();
  });

  it('renders every trailing action and calls its onPress', () => {
    const onPress = jest.fn();
    render(
      <AppBar
        title="Painel"
        actions={[{ icon: 'Bell', label: 'Notificações', onPress, testID: 'action-bell' }]}
      />,
    );

    fireEvent.press(screen.getByTestId('action-bell'));

    expect(onPress).toHaveBeenCalled();
  });

  it('renders an action without a testID via its accessible label', () => {
    const onPress = jest.fn();
    render(<AppBar title="Painel" actions={[{ icon: 'Bell', label: 'Notificações', onPress }]} />);

    fireEvent.press(screen.getByLabelText('Notificações'));

    expect(onPress).toHaveBeenCalled();
  });

  it('renders trailing content between the title and the actions', () => {
    render(
      <AppBar
        title="Painel"
        trailing={<Text>filtro</Text>}
        actions={[{ icon: 'Bell', label: 'Notificações', onPress: jest.fn() }]}
      />,
    );

    expect(screen.getByText('filtro')).toBeTruthy();
  });

  it('is transparent with no bottom border and a heading-sized title', () => {
    render(<AppBar title="Painel" testID="bar" />);

    const bar = StyleSheet.flatten(screen.getByTestId('bar').props.style);
    expect(bar.backgroundColor).toBe('transparent');
    expect(bar.borderBottomWidth).toBeUndefined();
    expect(screen.getByText('Painel').props.style).toMatchObject({
      fontSize: fontSize.h4,
      fontWeight: fontWeight.heading,
      color: color.text,
    });
  });

  it('renders the back button and actions as circular surface buttons', () => {
    render(
      <AppBar
        title="Painel"
        onBackPress={jest.fn()}
        actions={[{ icon: 'Bell', label: 'Notificações', onPress: jest.fn() }]}
      />,
    );

    for (const label of ['Voltar', 'Notificações']) {
      expect(StyleSheet.flatten(screen.getByLabelText(label).props.style)).toMatchObject({
        backgroundColor: color.surface2,
        borderRadius: radii.pill,
      });
    }
  });

  it('works without a testID on the back button', () => {
    const onBackPress = jest.fn();
    render(<AppBar title="Painel" onBackPress={onBackPress} />);

    fireEvent.press(screen.getByLabelText('Voltar'));

    expect(onBackPress).toHaveBeenCalled();
  });
});
