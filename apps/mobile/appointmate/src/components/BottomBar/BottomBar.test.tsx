import { StyleSheet, Text } from 'react-native';
import { color, radii } from '@industry/tokens';
import { render, screen } from '../../test-utils';
import { BottomBar } from './BottomBar';

describe('BottomBar', () => {
  it('renders its children', () => {
    render(
      <BottomBar testID="bottom-bar">
        <Text>Enviar</Text>
      </BottomBar>,
    );
    expect(screen.getByText('Enviar')).toBeTruthy();
  });

  it('forwards testID to the container', () => {
    render(
      <BottomBar testID="bottom-bar">
        <Text>Enviar</Text>
      </BottomBar>,
    );
    expect(screen.getByTestId('bottom-bar')).toBeTruthy();
  });

  it('sits on a filled surface with rounded top corners and no border', () => {
    render(
      <BottomBar testID="bottom-bar">
        <Text>Enviar</Text>
      </BottomBar>,
    );
    const style = StyleSheet.flatten(screen.getByTestId('bottom-bar').props.style);
    expect(style.backgroundColor).toBe(color.surface);
    expect(style.borderTopLeftRadius).toBe(radii.lg);
    expect(style.borderTopRightRadius).toBe(radii.lg);
    expect(style.borderTopWidth).toBeUndefined();
  });
});
