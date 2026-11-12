import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { glow, gradient } from '@industry/tokens';
import type { GradientName } from '@industry/tokens';
import { GradientSurface } from './GradientSurface';

const flatStyle = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('GradientSurface', () => {
  it('clips its content to the given radius', () => {
    render(
      <GradientSurface testID="s" radius={12}>
        <Text>x</Text>
      </GradientSurface>,
    );
    expect(flatStyle('s')).toMatchObject({ borderRadius: 12, overflow: 'hidden' });
  });

  it('renders its children', () => {
    render(
      <GradientSurface>
        <Text>conteúdo</Text>
      </GradientSurface>,
    );
    expect(screen.getByText('conteúdo')).toBeTruthy();
  });

  it.each(['primary', 'surface', 'backdrop'] as GradientName[])(
    'draws the %s gradient from the token',
    (variant) => {
      render(<GradientSurface testID="s" variant={variant} />);
      const { colors, angle } = gradient[variant];
      expect(flatStyle('s').experimental_backgroundImage).toBe(
        `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`,
      );
    },
  );

  it('defaults to the surface gradient', () => {
    render(<GradientSurface testID="s" />);
    expect(flatStyle('s').experimental_backgroundImage).toContain(gradient.surface.colors[0]);
  });

  it('falls back to the first gradient stop as a solid background', () => {
    render(<GradientSurface testID="s" variant="primary" />);
    expect(flatStyle('s').backgroundColor).toBe(gradient.primary.colors[0]);
  });

  it('adds the accent glow only when asked', () => {
    render(<GradientSurface testID="s" />);
    expect(flatStyle('s').boxShadow).toBeUndefined();
  });

  it('draws the glow on the same clipped view', () => {
    render(<GradientSurface testID="s" glow radius={16} />);
    expect(flatStyle('s')).toMatchObject({
      boxShadow: glow.accent,
      borderRadius: 16,
      overflow: 'hidden',
    });
  });

  it('lets consumer style override and extend the surface', () => {
    render(
      <GradientSurface
        testID="s"
        glow
        style={{ width: 120, margin: 4, flexDirection: 'row', gap: 8, borderRadius: 4 }}
      />,
    );
    expect(flatStyle('s')).toMatchObject({
      width: 120,
      margin: 4,
      flexDirection: 'row',
      gap: 8,
      borderRadius: 4,
    });
  });
});
