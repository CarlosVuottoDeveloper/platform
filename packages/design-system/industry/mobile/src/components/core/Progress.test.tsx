import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { color, gradient, neutral, radii, space } from '@industry/tokens';
import { Progress, Spinner } from './Progress';

describe('Progress', () => {
  it('exposes the current value via accessibilityValue', () => {
    const { getByTestId } = render(<Progress value={40} max={80} testID="progress" />);

    expect(getByTestId('progress').props.accessibilityValue).toMatchObject({
      min: 0,
      max: 80,
      now: 40,
    });
  });

  it('renders the rounded percentage by default', () => {
    const { getByText } = render(<Progress value={33} max={100} />);

    expect(getByText('33%')).toBeTruthy();
  });

  it('hides the percentage when showValue is false', () => {
    const { queryByText } = render(<Progress value={33} showValue={false} />);

    expect(queryByText('33%')).toBeNull();
  });

  it('hides the percentage but still shows the label row when both label and showValue=false are given', () => {
    const { getByText, queryByText } = render(
      <Progress value={33} label="Enviando" showValue={false} />,
    );

    expect(getByText('Enviando')).toBeTruthy();
    expect(queryByText('33%')).toBeNull();
  });

  it('defaults to value 0', () => {
    const { getByTestId } = render(<Progress testID="progress" />);

    expect(getByTestId('progress').props.accessibilityValue).toMatchObject({ now: 0 });
  });

  it('renders the label', () => {
    const { getByText } = render(<Progress value={10} label="Enviando" />);

    expect(getByText('Enviando')).toBeTruthy();
  });

  it('clamps the value between 0 and 100 percent', () => {
    const { getByText } = render(<Progress value={999} max={100} />);

    expect(getByText('100%')).toBeTruthy();
  });
});

describe('Spinner', () => {
  it('renders as an accessible status indicator', () => {
    const { getByLabelText } = render(<Spinner />);

    expect(getByLabelText('Carregando')).toBeTruthy();
  });
});

describe('Progress look', () => {
  const flat = (node: { props: { style?: unknown } }) =>
    StyleSheet.flatten(node.props.style as never) as Record<string, unknown>;

  it('draws a pill track on surface2', () => {
    const { getByTestId } = render(<Progress value={40} testID="progress" />);

    expect(flat(getByTestId('progress'))).toMatchObject({
      backgroundColor: color.surface2,
      borderRadius: radii.pill,
      overflow: 'hidden',
      height: space[2],
    });
  });

  it('clips the fill to the animated width with a pill radius', () => {
    const { getByTestId } = render(<Progress value={40} testID="progress" />);
    const fill = flat(getByTestId('progress-fill'));

    expect(fill).toMatchObject({ borderRadius: radii.pill, overflow: 'hidden', width: '40%' });
  });

  it('draws the primary gradient at the full track width so it does not rescale', () => {
    const { getByTestId } = render(<Progress value={40} testID="progress" />);
    fireEvent(getByTestId('progress'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 200, height: space[2] } },
    });
    const gradientStyle = flat(getByTestId('progress-gradient'));

    expect(gradientStyle.width).toBe(200);
    expect(gradientStyle.experimental_backgroundImage).toContain(gradient.primary.colors[0]);
    expect(gradientStyle.experimental_backgroundImage).toContain(gradient.primary.colors[1]);
    expect(gradientStyle.boxShadow).toBeUndefined();
  });

  it('mutes the label and the percentage with neutral 400', () => {
    const { getByText } = render(<Progress value={33} label="Enviando" />);

    expect(flat(getByText('Enviando')).color).toBe(neutral['400']);
    expect(flat(getByText('33%')).color).toBe(neutral['400']);
  });
});
