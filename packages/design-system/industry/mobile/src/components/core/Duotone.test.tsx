import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { color, alpha, radii } from '@industry/tokens';
import { Duotone } from './Duotone';

describe('Duotone', () => {
  it('renders its children', () => {
    const { getByText } = render(
      <Duotone>
        <Text>photo</Text>
      </Duotone>,
    );
    expect(getByText('photo')).toBeTruthy();
  });

  it('renders an accent-tinted overlay', () => {
    const { getByTestId } = render(<Duotone />);
    const overlay = getByTestId('duotone-overlay');
    expect(overlay.props.style).toMatchObject({ backgroundColor: alpha(color.accent, 55) });
  });
});

describe('Duotone shape', () => {
  it('rounds and clips to radii.lg, keeping a consumer radius override', () => {
    const { getByTestId, rerender } = render(<Duotone />);
    const root = () => getByTestId('duotone-overlay').parent!.parent!;
    expect(StyleSheet.flatten(root().props.style)).toMatchObject({
      borderRadius: radii.lg,
      overflow: 'hidden',
    });

    rerender(<Duotone style={{ borderRadius: 4 }} />);
    expect(StyleSheet.flatten(root().props.style).borderRadius).toBe(4);
  });
});
