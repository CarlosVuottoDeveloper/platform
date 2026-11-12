import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { glow, radii, shadow } from '@industry/tokens';
import { FAB } from './FAB';
import { PRIMARY_ACTION_FILL } from './PrimaryActionSurface';

const grant = {
  nativeEvent: { touches: [], changedTouches: [], timestamp: 0 },
  persist: jest.fn(),
};

describe('FAB', () => {
  it('renders with its accessible label', () => {
    render(<FAB label="Novo chamado" />);
    expect(screen.getByLabelText('Novo chamado')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<FAB label="Novo chamado" onPress={onPress} />);

    fireEvent.press(screen.getByLabelText('Novo chamado'));

    expect(onPress).toHaveBeenCalled();
  });

  it('does not call onPress while disabled', () => {
    const onPress = jest.fn();
    render(<FAB label="Novo chamado" onPress={onPress} disabled />);

    fireEvent.press(screen.getByLabelText('Novo chamado'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('is a circle with the primary gradient and the accent glow', () => {
    render(<FAB label="Novo chamado" />);
    const surface = StyleSheet.flatten(screen.getByTestId('fab-surface').props.style);
    expect(surface.borderRadius).toBe(radii.pill);
    expect(surface.boxShadow).toBe(glow.accent);
    expect(StyleSheet.flatten(screen.getByLabelText('Novo chamado').props.style).borderRadius).toBe(
      radii.pill,
    );
  });

  it('keeps an opaque fill and the large elevation on the container', () => {
    render(<FAB label="Novo chamado" />);
    expect(StyleSheet.flatten(screen.getByLabelText('Novo chamado').props.style)).toMatchObject({
      backgroundColor: PRIMARY_ACTION_FILL,
      elevation: shadow.lg.elevation,
    });
  });

  it('shows no glow and dims when disabled', () => {
    render(<FAB label="Novo chamado" disabled />);
    expect(
      StyleSheet.flatten(screen.getByTestId('fab-surface').props.style).boxShadow,
    ).toBeUndefined();
    expect(StyleSheet.flatten(screen.getByLabelText('Novo chamado').props.style).opacity).toBe(
      0.45,
    );
  });

  it('dims the surface while pressed and forwards onPressIn', () => {
    const onPressIn = jest.fn();
    render(<FAB label="Novo chamado" onPressIn={onPressIn} />);
    const surfaceOpacity = () =>
      StyleSheet.flatten(screen.getByTestId('fab-surface').props.style).opacity;
    expect(surfaceOpacity()).toBe(1);

    fireEvent(screen.getByLabelText('Novo chamado'), 'responderGrant', grant);

    expect(surfaceOpacity()).toBe(0.85);
    expect(onPressIn).toHaveBeenCalled();
  });

  it('sizes the icon down and shrinks the box for the "md" size', () => {
    render(<FAB label="Novo chamado" size="md" />);
    const [flattened] = screen.getByLabelText('Novo chamado').props.style;
    expect(flattened).toMatchObject({ width: 48, height: 48 });
  });

  it('defaults to the "lg" box size', () => {
    render(<FAB label="Novo chamado" />);
    const [flattened] = screen.getByLabelText('Novo chamado').props.style;
    expect(flattened).toMatchObject({ width: 56, height: 56 });
  });
});
