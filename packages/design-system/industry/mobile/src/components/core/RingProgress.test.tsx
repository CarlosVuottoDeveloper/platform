import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { RingProgress, resolveRingDash } from './RingProgress';

const CIRCUMFERENCE_AT_RADIUS_50 = 2 * Math.PI * 50;

describe('resolveRingDash', () => {
  it('fills the whole circumference when value equals max', () => {
    const { fraction, dashoffset } = resolveRingDash(100, 100, 50);
    expect(fraction).toBe(1);
    expect(dashoffset).toBeCloseTo(0);
  });

  it('draws half the circumference at half of max', () => {
    const { fraction, dashoffset, dasharray } = resolveRingDash(50, 100, 50);
    expect(fraction).toBe(0.5);
    expect(dashoffset).toBeCloseTo(CIRCUMFERENCE_AT_RADIUS_50 / 2);
    expect(dasharray).toBe(`${CIRCUMFERENCE_AT_RADIUS_50} ${CIRCUMFERENCE_AT_RADIUS_50}`);
  });

  it('clamps a value above max to a full ring', () => {
    expect(resolveRingDash(250, 100, 50).fraction).toBe(1);
  });

  it('clamps a negative value to an empty ring', () => {
    const { fraction, dashoffset } = resolveRingDash(-10, 100, 50);
    expect(fraction).toBe(0);
    expect(dashoffset).toBeCloseTo(CIRCUMFERENCE_AT_RADIUS_50);
  });

  it('yields fraction 0 when max is zero or negative', () => {
    expect(resolveRingDash(10, 0, 50).fraction).toBe(0);
    expect(resolveRingDash(10, -5, 50).fraction).toBe(0);
  });
});

describe('RingProgress', () => {
  it('exposes a progressbar with min, max and the current value', () => {
    render(<RingProgress value={45} accessibilityLabel="Progresso" testID="ring" />);

    const bar = screen.getByRole('progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 45 });
    expect(bar.props.accessibilityLabel).toBe('Progresso');
  });

  it('reports the clamped value as now', () => {
    render(<RingProgress value={300} max={200} />);
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
      min: 0,
      max: 200,
      now: 200,
    });
  });

  it('reports zero as now for a negative value', () => {
    render(<RingProgress value={-4} />);
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(0);
  });

  it('draws a full ring when value is above max', () => {
    render(<RingProgress value={500} testID="ring" />);
    expect(screen.getByTestId('ring-arc').props.strokeDashoffset ?? 0).toBeCloseTo(0);
  });

  it('leaves half the arc undrawn at half of max', () => {
    render(<RingProgress value={50} testID="ring" />);
    expect(screen.getByTestId('ring-arc').props.strokeDashoffset).toBeCloseTo(Math.PI * 53);
  });

  it('draws no arc when value is negative', () => {
    render(<RingProgress value={-5} testID="ring" />);
    expect(screen.queryByTestId('ring-arc')).toBeNull();
    expect(screen.getByTestId('ring-track')).toBeTruthy();
  });

  it('renders the centerLabel', () => {
    render(<RingProgress value={45} centerLabel={<Text>45%</Text>} />);
    expect(screen.getByText('45%')).toBeTruthy();
  });

  it('sizes the root to the size prop and defaults to 120', () => {
    render(<RingProgress value={10} testID="ring" />);
    expect(StyleSheet.flatten(screen.getByTestId('ring').props.style)).toMatchObject({
      width: 120,
      height: 120,
    });
  });
});
