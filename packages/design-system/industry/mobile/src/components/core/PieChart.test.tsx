import { StyleSheet, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PieChart, defaultValueFormatter, resolveSliceDash } from './PieChart';

const SLICES = [
  { label: 'Aberto', value: 3, color: '#111' },
  { label: 'Em Progresso', value: 1, color: '#222' },
  { label: 'Concluído', value: 6, color: '#333' },
];

describe('defaultValueFormatter', () => {
  it('formats a number using pt-BR grouping', () => {
    expect(defaultValueFormatter(1000)).toBe('1.000');
  });
});

describe('resolveSliceDash', () => {
  it('gives the first slice no starting offset', () => {
    const { dashoffset } = resolveSliceDash(SLICES, 0, 10);
    expect(dashoffset).toBe(-0);
  });

  it('offsets each following slice by the running total so far', () => {
    const { dashoffset } = resolveSliceDash(SLICES, 1, 10);
    // 3/10 of the circumference (2π·70) already consumed by the first slice.
    expect(dashoffset).toBeCloseTo(-(3 / 10) * 2 * Math.PI * 70);
  });

  it('sizes the dasharray proportionally to the slice value', () => {
    const { dasharray } = resolveSliceDash(SLICES, 2, 10);
    const [length] = dasharray.split(' ').map(Number);
    expect(length).toBeCloseTo((6 / 10) * 2 * Math.PI * 70);
  });

  it('returns a zero-length dasharray when the total is zero', () => {
    const { dasharray, dashoffset } = resolveSliceDash([{ value: 0 }], 0, 0);
    expect(dasharray.startsWith('0 ')).toBe(true);
    expect(dashoffset).toBe(-0);
  });
});

describe('PieChart', () => {
  it('renders every slice in the legend with its formatted value and percentage', () => {
    render(<PieChart slices={SLICES} />);

    expect(screen.getByText('Aberto')).toBeTruthy();
    expect(screen.getByText('3 · 30%')).toBeTruthy();
    expect(screen.getByText('Concluído')).toBeTruthy();
    expect(screen.getByText('6 · 60%')).toBeTruthy();
  });

  it('renders 0% legend rows when every slice is empty', () => {
    render(<PieChart slices={[{ label: 'Vazio', value: 0, color: '#000' }]} />);
    expect(screen.getByText('0 · 0%')).toBeTruthy();
  });

  it('dims the other legend rows once one is pressed, and restores on a second press', () => {
    render(<PieChart slices={SLICES} />);
    const row = screen.getByLabelText('Aberto: 3, 30%');
    const otherRow = screen.getByLabelText('Concluído: 6, 60%');

    fireEvent.press(row);
    expect(otherRow.props.style).toMatchObject({ opacity: 0.5 });
    expect(row.props.style).toMatchObject({ opacity: 1 });

    fireEvent.press(row);
    expect(otherRow.props.style).toMatchObject({ opacity: 1 });
  });

  it('accepts a custom valueFormatter', () => {
    render(<PieChart slices={SLICES} valueFormatter={(v) => `#${v}`} />);
    expect(screen.getByText('#3 · 30%')).toBeTruthy();
  });

  it('stacks the legend below the chart by default', () => {
    render(<PieChart slices={SLICES} testID="chart" />);
    expect(
      StyleSheet.flatten(screen.getByTestId('chart').props.style).flexDirection,
    ).toBeUndefined();
  });

  it('places the legend beside the chart when legendPlacement is "right"', () => {
    render(<PieChart slices={SLICES} legendPlacement="right" testID="chart" />);
    expect(StyleSheet.flatten(screen.getByTestId('chart').props.style).flexDirection).toBe('row');
  });

  it('shows only the percentage when legendValue is "percent"', () => {
    render(<PieChart slices={SLICES} legendValue="percent" />);
    expect(screen.getByText('30%')).toBeTruthy();
    expect(screen.queryByText('3 · 30%')).toBeNull();
    expect(screen.getByLabelText('Aberto: 3, 30%')).toBeTruthy();
  });

  it('renders a centerLabel over the donut', () => {
    render(<PieChart slices={SLICES} centerLabel={<Text>10</Text>} />);
    expect(screen.getByText('10')).toBeTruthy();
  });
});
