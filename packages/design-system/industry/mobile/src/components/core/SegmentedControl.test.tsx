import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { color, gradient, neutral, radii } from '@industry/tokens';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl', () => {
  it('marks the option matching value as checked', () => {
    const { getByTestId, queryByTestId } = render(
      <SegmentedControl options={['a', 'b']} value="b" onValueChange={jest.fn()} />,
    );

    expect(getByTestId('segment-option-a').props.accessibilityState).toMatchObject({
      checked: false,
    });
    expect(getByTestId('segment-option-b').props.accessibilityState).toMatchObject({
      checked: true,
    });
    expect(getByTestId('segment-surface-b')).toBeTruthy();
    expect(queryByTestId('segment-surface-a')).toBeNull();
  });

  it('calls onValueChange with the pressed option value', () => {
    const onValueChange = jest.fn();
    const { getByTestId } = render(
      <SegmentedControl options={['a', 'b']} value="a" onValueChange={onValueChange} />,
    );

    fireEvent(getByTestId('segment-option-b'), 'press');

    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('renders object options by their label', () => {
    const { getByText } = render(
      <SegmentedControl
        options={[{ value: 'grid', label: 'Grade' }]}
        value="grid"
        onValueChange={jest.fn()}
      />,
    );

    expect(getByText('Grade')).toBeTruthy();
  });

  it('wraps the options in a surface pill', () => {
    const { getByTestId } = render(
      <SegmentedControl testID="seg" options={['a']} value="a" onValueChange={jest.fn()} />,
    );
    expect(StyleSheet.flatten(getByTestId('seg').props.style)).toMatchObject({
      backgroundColor: color.surface,
      borderRadius: radii.pill,
    });
  });

  it('paints the active segment with the primary gradient and no glow', () => {
    const { getByTestId } = render(
      <SegmentedControl options={['a', 'b']} value="a" onValueChange={jest.fn()} />,
    );
    const style = StyleSheet.flatten(getByTestId('segment-surface-a').props.style);
    expect(style.experimental_backgroundImage).toContain(gradient.primary.colors[0]);
    expect(style.borderRadius).toBe(radii.pill);
    expect(style.boxShadow).toBeUndefined();
  });

  it('shows the active label in the text color and inactive labels muted', () => {
    const { getByText } = render(
      <SegmentedControl options={['a', 'b']} value="a" onValueChange={jest.fn()} />,
    );
    expect(getByText('a').props.style).toMatchObject({ color: color.text });
    expect(getByText('b').props.style).toMatchObject({ color: neutral['400'] });
  });
});
