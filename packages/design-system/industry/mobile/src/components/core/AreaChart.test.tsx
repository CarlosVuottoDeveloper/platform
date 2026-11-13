import { StyleSheet, processColor } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { accent2Ramp, neutral, viz } from '@industry/tokens';
import { AreaChart, buildAreaPath, selectLabelIndexes } from './AreaChart';

const POINTS = [
  { label: 'Jan', value: 50 },
  { label: 'Fev', value: 75 },
  { label: 'Mar', value: 25 },
];

const measure = (testID: string, width = 300) =>
  fireEvent(screen.getByTestId(`${testID}-plot`), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width, height: 180 } },
  });

const numbersIn = (path: string) => (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe('buildAreaPath', () => {
  it('returns empty paths for an empty list', () => {
    expect(buildAreaPath([], 300, 100)).toEqual({ line: '', area: '' });
  });

  it('draws a horizontal segment across the width for a single point', () => {
    const { line, area } = buildAreaPath([{ value: 10 }], 300, 100);
    const nums = numbersIn(line);

    expect(line).not.toContain('NaN');
    expect(area).not.toContain('NaN');
    expect(nums).toEqual([0, nums[1], 300, nums[1]]);
  });

  it('draws a horizontal line at mid-height when all values are equal', () => {
    const { line } = buildAreaPath([{ value: 7 }, { value: 7 }, { value: 7 }], 200, 100);
    const ys = numbersIn(line).filter((_, i) => i % 2 === 1);

    expect(line).not.toContain('NaN');
    expect(line).not.toContain('Infinity');
    expect(new Set(ys)).toEqual(new Set([50]));
  });

  it('spreads points evenly across the width, highest value on top', () => {
    const { line } = buildAreaPath(POINTS, 200, 100);
    const [x0, y0, x1, y1, x2, y2] = numbersIn(line) as [
      number,
      number,
      number,
      number,
      number,
      number,
    ];

    expect([x0, x1, x2]).toEqual([0, 100, 200]);
    expect(y1).toBeLessThan(y0);
    expect(y2).toBeGreaterThan(y0);
  });

  it('keeps the stroke inside the box with a small inset', () => {
    const ys = numbersIn(buildAreaPath(POINTS, 200, 100).line).filter((_, i) => i % 2 === 1);

    expect(Math.min(...ys)).toBeGreaterThan(0);
    expect(Math.max(...ys)).toBeLessThan(100);
  });

  it('closes the area down to the bottom edge', () => {
    const { area } = buildAreaPath(POINTS, 200, 100);

    expect(area.startsWith('M')).toBe(true);
    expect(area).toContain('L200 100');
    expect(area).toContain('L0 100');
    expect(area.endsWith('Z')).toBe(true);
  });
});

describe('selectLabelIndexes', () => {
  it('selects nothing for no points', () => {
    expect(selectLabelIndexes(0, 7)).toEqual([]);
  });

  it('selects the only index for a single point', () => {
    expect(selectLabelIndexes(1, 7)).toEqual([0]);
  });

  it('selects every index when the count fits the maximum', () => {
    expect(selectLabelIndexes(7, 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('thins to the maximum, keeping first and last, when one over', () => {
    const indexes = selectLabelIndexes(8, 7);
    expect(indexes).toHaveLength(7);
    expect(indexes[0]).toBe(0);
    expect(indexes[6]).toBe(7);
    expect(new Set(indexes).size).toBe(7);
  });

  it('thins 30 points to 7 evenly spaced indexes including first and last', () => {
    expect(selectLabelIndexes(30, 7)).toEqual([0, 5, 10, 15, 19, 24, 29]);
  });
});

describe('AreaChart', () => {
  it('renders only the grid for an empty list, without error', () => {
    render(<AreaChart points={[]} testID="chart" />);
    measure('chart');

    expect(screen.getByTestId('chart-grid-0')).toBeTruthy();
    expect(screen.queryByTestId('chart-line')).toBeNull();
    expect(screen.queryByTestId('chart-area')).toBeNull();
  });

  it('renders no drawing until the width is measured', () => {
    render(<AreaChart points={POINTS} testID="chart" />);

    expect(screen.getByTestId('chart-grid-0')).toBeTruthy();
    expect(screen.queryByTestId('chart-line')).toBeNull();

    measure('chart');
    expect(screen.getByTestId('chart-line')).toBeTruthy();
    expect(screen.getByTestId('chart-area')).toBeTruthy();
  });

  it('renders no NaN for a single point', () => {
    render(<AreaChart points={[{ label: 'Jan', value: 5 }]} testID="chart" />);
    measure('chart');

    expect(screen.getByTestId('chart-line').props.d).not.toContain('NaN');
  });

  it('strokes the line with accent 2 400 and the grid with viz grid', () => {
    render(<AreaChart points={POINTS} testID="chart" />);
    measure('chart');

    expect(screen.getByTestId('chart-line').props.stroke).toEqual({
      type: 0,
      payload: processColor(accent2Ramp['400']),
    });
    expect(StyleSheet.flatten(screen.getByTestId('chart-grid-0').props.style).backgroundColor).toBe(
      viz.grid,
    );
  });

  it('shows the point labels on the x axis', () => {
    render(<AreaChart points={POINTS} testID="chart" />);
    measure('chart');

    expect(screen.getByText('Jan')).toBeTruthy();
    expect(screen.getByText('Fev')).toBeTruthy();
    expect(screen.getByText('Mar')).toBeTruthy();
  });

  it('labels the y axis from min to max using valueFormatter, defaulting to String', () => {
    render(<AreaChart points={POINTS} />);

    expect(screen.getByText('75')).toBeTruthy();
    expect(screen.getByText('25')).toBeTruthy();
  });

  it('applies a custom valueFormatter to the y labels', () => {
    render(<AreaChart points={POINTS} valueFormatter={(v) => `${v} kWh`} />);

    expect(screen.getByText('75 kWh')).toBeTruthy();
  });

  it('mutes the labels with neutral 400', () => {
    render(<AreaChart points={POINTS} testID="chart" />);
    measure('chart');

    expect(StyleSheet.flatten(screen.getByText('Jan').props.style).color).toBe(neutral['400']);
  });

  it('formats the y ticks with at most one decimal in pt-BR by default', () => {
    render(
      <AreaChart
        points={[
          { label: 'a', value: 40 },
          { label: 'b', value: 110 },
        ]}
      />,
    );

    expect(screen.getByText('86,7')).toBeTruthy();
    expect(screen.getByText('63,3')).toBeTruthy();
  });

  it('hands a custom valueFormatter ticks rounded to one decimal', () => {
    const formatter = jest.fn((v: number) => `#${v}`);
    render(
      <AreaChart
        points={[
          { label: 'a', value: 40 },
          { label: 'b', value: 110 },
        ]}
        valueFormatter={formatter}
      />,
    );

    expect(screen.getByText('#86.7')).toBeTruthy();
  });

  it('renders every label of a series with repeated labels', () => {
    const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((label, i) => ({ label, value: i }));
    render(<AreaChart points={days} testID="chart" />);
    measure('chart');

    expect(screen.getAllByText('S')).toHaveLength(3);
    expect(screen.getAllByText('Q')).toHaveLength(2);
  });

  it('draws to the width of the plot, not of the padded root', () => {
    render(<AreaChart points={POINTS} style={{ padding: 16 }} testID="chart" />);
    fireEvent(screen.getByTestId('chart'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 332, height: 180 } },
    });
    expect(screen.queryByTestId('chart-line')).toBeNull();

    measure('chart', 300);
    expect(screen.getByTestId('chart-line').props.d).toContain('L300 ');
  });

  it('shows distinct y labels for a flat series', () => {
    render(
      <AreaChart
        points={[
          { label: 'a', value: 5 },
          { label: 'b', value: 5 },
        ]}
      />,
    );

    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('5,3')).toBeTruthy();
  });

  it('shows at most 7 x labels for 30 points, keeping first and last', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ label: `d${i}`, value: i }));
    render(<AreaChart points={many} testID="chart" />);
    measure('chart');

    expect(screen.getAllByText(/^d\d+$/)).toHaveLength(7);
    expect(screen.getByText('d0')).toBeTruthy();
    expect(screen.getByText('d29')).toBeTruthy();
  });

  it('centres a single point label inside the plot', () => {
    render(<AreaChart points={[{ label: 'Unico', value: 3 }]} testID="chart" />);
    measure('chart', 280);

    const style = StyleSheet.flatten(screen.getByText('Unico').props.style);
    expect(style.left).toBe(120);
    expect(style.width).toBe(40);
  });

  it('keeps the first and last labels inside the plot', () => {
    render(<AreaChart points={POINTS} testID="chart" />);
    measure('chart', 280);

    expect(StyleSheet.flatten(screen.getByText('Jan').props.style).left).toBe(0);
    expect(StyleSheet.flatten(screen.getByText('Mar').props.style).left).toBe(240);
  });

  it('is not an image and has no label without points', () => {
    render(<AreaChart points={[]} testID="chart" />);

    const chart = screen.getByTestId('chart');
    expect(chart.props.accessibilityRole).toBeUndefined();
    expect(chart.props.accessibilityLabel).toBeUndefined();
  });

  it('is an image whose label lists every point through valueFormatter', () => {
    render(<AreaChart points={POINTS} valueFormatter={(v) => `${v}!`} testID="chart" />);

    const chart = screen.getByTestId('chart');
    expect(chart.props.accessibilityRole).toBe('image');
    expect(chart.props.accessibilityLabel).toBe('Jan 50!, Fev 75!, Mar 25!');
  });

  it('uses the height prop for the plot area and defaults to 180', () => {
    const { rerender } = render(<AreaChart points={POINTS} testID="chart" />);
    expect(StyleSheet.flatten(screen.getByTestId('chart-plot').props.style).height).toBe(180);

    rerender(<AreaChart points={POINTS} height={240} testID="chart" />);
    expect(StyleSheet.flatten(screen.getByTestId('chart-plot').props.style).height).toBe(240);
  });
});
