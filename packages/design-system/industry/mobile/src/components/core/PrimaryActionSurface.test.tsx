import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { glow, gradient, radii } from '@industry/tokens';
import { PRIMARY_ACTION_FILL, PrimaryActionSurface } from './PrimaryActionSurface';

const surfaceStyle = () => StyleSheet.flatten(screen.getByTestId('surface').props.style);

describe('PrimaryActionSurface', () => {
  it('fills the pill with the primary gradient and the accent glow', () => {
    render(<PrimaryActionSurface pressed={false} disabled={false} testID="surface" />);
    expect(surfaceStyle()).toMatchObject({
      borderRadius: radii.pill,
      boxShadow: glow.accent,
      opacity: 1,
    });
  });

  it('dims while pressed', () => {
    render(<PrimaryActionSurface pressed disabled={false} testID="surface" />);
    expect(surfaceStyle().opacity).toBe(0.85);
  });

  it('drops the glow and ignores a stale pressed flag when disabled', () => {
    render(<PrimaryActionSurface pressed disabled testID="surface" />);
    expect(surfaceStyle().boxShadow).toBeUndefined();
    expect(surfaceStyle().opacity).toBe(1);
  });

  it('exposes the darker gradient stop as the opaque base fill', () => {
    expect(PRIMARY_ACTION_FILL).toBe(gradient.primary.colors[1]);
  });
});
