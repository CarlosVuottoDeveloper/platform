import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { alpha, color, gradient, radii } from '@industry/tokens';
import { Card } from './Card';

describe('Card', () => {
  it('renders kicker, title, body and meta', () => {
    const { getByText } = render(
      <Card kicker="Projeto" title="Título" body="Corpo do card" meta="há 2h" />,
    );

    expect(getByText('Projeto')).toBeTruthy();
    expect(getByText('Título')).toBeTruthy();
    expect(getByText('Corpo do card')).toBeTruthy();
    expect(getByText('há 2h')).toBeTruthy();
  });

  it('renders children alongside the structured slots', () => {
    const { getByText } = render(
      <Card title="Título">
        <Text>Conteúdo extra</Text>
      </Card>,
    );

    expect(getByText('Conteúdo extra')).toBeTruthy();
  });

  it('omits optional slots that are not provided', () => {
    const { getByText, queryByText } = render(<Card title="Só título" />);

    expect(getByText('Só título')).toBeTruthy();
    expect(queryByText('há 2h')).toBeNull();
  });

  it('applies the elevation shadow when given', () => {
    const { getByTestId } = render(<Card testID="elevated-card" elevation="md" />);

    expect(StyleSheet.flatten(getByTestId('elevated-card').props.style).shadowOpacity).toBe(0.45);
  });

  it('omits the title slot when not provided', () => {
    const { queryByText } = render(<Card body="Só corpo" />);

    expect(queryByText('Só corpo')).toBeTruthy();
  });

  it('colors the title with the theme text color, not the default black', () => {
    const { getByText } = render(<Card title="Título" />);

    const styles = [getByText('Título').props.style].flat();
    expect(styles.some((s) => s?.color === color.text)).toBe(true);
  });

  it('is a large rounded gradient surface with a soft border', () => {
    const { getByTestId } = render(<Card testID="card" />);

    const style = StyleSheet.flatten(getByTestId('card').props.style);
    expect(style.borderRadius).toBe(radii.lg);
    expect(style.backgroundColor).toBe(gradient.surface.colors[0]);
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe(alpha(color.text, 8));
  });

  it('keeps the kicker in its original case', () => {
    const { getByText } = render(<Card kicker="Projeto" />);

    const style = StyleSheet.flatten(getByText('Projeto').props.style);
    expect(style.textTransform).toBeUndefined();
    expect(style.letterSpacing).toBeUndefined();
  });
});
