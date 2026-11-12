import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { color, radii, semanticColor } from '@industry/tokens';
import { Badge } from './Badge';

describe('Badge', () => {
  it('is a pill', () => {
    const { getByTestId } = render(<Badge testID="badge">Publicado</Badge>);
    expect(StyleSheet.flatten(getByTestId('badge').props.style).borderRadius).toBe(radii.pill);
  });

  it('keeps the label as typed, without capitalising it', () => {
    const { getByText } = render(<Badge>Publicado</Badge>);
    expect(StyleSheet.flatten(getByText('Publicado').props.style).textTransform).toBeUndefined();
  });

  it('renders string children as text', () => {
    const { getByText } = render(<Badge>Publicado</Badge>);

    expect(getByText('Publicado')).toBeTruthy();
  });

  it('renders non-string children as-is', () => {
    const { getByText } = render(
      <Badge>
        <Text>Custom</Text>
      </Badge>,
    );

    expect(getByText('Custom')).toBeTruthy();
  });

  it('is outlined and filled with surface2 by default', () => {
    const { getByTestId } = render(
      <Badge tone="success" testID="badge">
        Publicado
      </Badge>,
    );

    expect(getByTestId('badge').props.style[0]).toMatchObject({ backgroundColor: color.surface2 });
  });

  it('fills the background with the tone color when solid is set', () => {
    const { getByTestId } = render(
      <Badge tone="success" solid testID="badge">
        Publicado
      </Badge>,
    );

    expect(getByTestId('badge').props.style[0]).toMatchObject({
      backgroundColor: semanticColor.success,
    });
  });

  it('fills accent solid badges with the accent color', () => {
    const { getByTestId } = render(
      <Badge tone="accent" solid testID="badge">
        Destaque
      </Badge>,
    );

    expect(getByTestId('badge').props.style[0]).toMatchObject({ backgroundColor: color.accent });
  });
});
