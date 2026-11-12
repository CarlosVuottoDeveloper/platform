import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { accentRamp, color, neutral, radii } from '@industry/tokens';
import { Stepper } from './Stepper';

const STEPS = ['Conta', 'Endereço', 'Confirmação'];

describe('Stepper', () => {
  it('renders every step label', () => {
    const { getByText } = render(<Stepper steps={STEPS} />);

    expect(getByText('Conta')).toBeTruthy();
    expect(getByText('Endereço')).toBeTruthy();
    expect(getByText('Confirmação')).toBeTruthy();
  });

  it('numbers pending steps and checkmarks done steps', () => {
    const { getByText } = render(<Stepper steps={STEPS} current={1} />);

    expect(getByText('✓')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it('accepts object steps', () => {
    const { getByText } = render(<Stepper steps={[{ label: 'Único' }]} />);

    expect(getByText('Único')).toBeTruthy();
  });

  it('renders every step as done when current is past the last index', () => {
    const { getAllByText } = render(<Stepper steps={STEPS} current={STEPS.length} />);

    expect(getAllByText('✓')).toHaveLength(STEPS.length);
  });

  it('defaults to the first step when current is not given', () => {
    const { getByTestId } = render(<Stepper steps={STEPS} />);

    expect(getByTestId('stepper-dot-0')).toBeTruthy();
  });

  it('accepts a non-string label', () => {
    const { getByText } = render(<Stepper steps={[{ label: <Text>Nó</Text> }]} />);

    expect(getByText('Nó')).toBeTruthy();
  });

  it('renders a connector between steps but not after the last one', () => {
    const { getByTestId, queryByTestId } = render(<Stepper steps={STEPS} />);

    expect(getByTestId('stepper-dot-0')).toBeTruthy();
    expect(getByTestId('stepper-dot-2')).toBeTruthy();
    expect(queryByTestId('stepper-dot-3')).toBeNull();
  });

  it('styles active, completed and upcoming markers as filled circles', () => {
    const { getByTestId, getByText } = render(<Stepper steps={STEPS} current={1} />);

    const marker = (index: number) =>
      StyleSheet.flatten(getByTestId(`stepper-dot-${index}`).props.style);
    expect(marker(1)).toMatchObject({ backgroundColor: color.accent, borderRadius: radii.pill });
    expect(marker(0)).toMatchObject({ backgroundColor: accentRamp['700'] });
    expect(marker(2)).toMatchObject({
      backgroundColor: color.surface2,
      borderColor: color.controlBorder,
    });
    expect(getByText('2').props.style).toMatchObject({ color: color.bg });
    expect(getByText('✓').props.style).toMatchObject({ color: color.text });
    expect(getByText('3').props.style).toMatchObject({ color: neutral['400'] });
  });

  it('shows the current label in the text colour and the others muted', () => {
    const { getByText } = render(<Stepper steps={STEPS} current={1} />);

    expect(getByText('Endereço').props.style).toMatchObject({ color: color.text });
    expect(getByText('Conta').props.style).toMatchObject({ color: neutral['400'] });
  });
});
