import { render, screen } from '@testing-library/react';
import { AreaChart, buildAreaPath } from './AreaChart';

const POINTS = [
  { label: 'Jan', value: 50 },
  { label: 'Fev', value: 75 },
  { label: 'Mar', value: 25 },
];

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

describe('AreaChart', () => {
  it('renders only the grid for an empty list, without error', () => {
    render(<AreaChart points={[]} testID="chart" />);

    expect(screen.getByTestId('chart-grid-0')).toBeInTheDocument();
    expect(screen.getByTestId('chart-line').getAttribute('d')).toBe('');
    expect(screen.getByTestId('chart-area').getAttribute('d')).toBe('');
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders no NaN for a single point', () => {
    render(<AreaChart points={[{ label: 'Jan', value: 5 }]} testID="chart" />);

    expect(screen.getByTestId('chart-line').getAttribute('d')).not.toContain('NaN');
  });

  it('strokes the line with accent 2 400 and the grid with viz grid', () => {
    render(<AreaChart points={POINTS} testID="chart" />);

    expect(screen.getByTestId('chart-line').getAttribute('stroke')).toBe(
      'var(--color-accent-2-400)',
    );
    expect(screen.getByTestId('chart-grid-0').style.background).toBe('var(--viz-grid)');
  });

  it('fills the area with a vertical gradient of the line colour fading from 35% to 0%', () => {
    render(<AreaChart points={POINTS} testID="chart" />);
    const area = screen.getByTestId('chart-area');
    const gradientId = (area.getAttribute('fill') as string).slice(5, -1);
    const stops = document.getElementById(gradientId)?.querySelectorAll('stop');

    expect(stops?.[0]?.style.stopColor).toBe('var(--color-accent-2-400)');
    expect(stops?.[0]?.getAttribute('stop-opacity')).toBe('0.35');
    expect(stops?.[1]?.getAttribute('stop-opacity')).toBe('0');
  });

  it('stretches the drawing to the container with a non-uniform viewBox', () => {
    render(<AreaChart points={POINTS} testID="chart" />);
    const svg = screen.getByTestId('chart-line').closest('svg') as SVGElement;

    expect(svg.getAttribute('preserveAspectRatio')).toBe('none');
    expect(svg.getAttribute('viewBox')).toMatch(/^0 0 \d+ 180$/);
  });

  it('shows the point labels on the x axis', () => {
    render(<AreaChart points={POINTS} />);

    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Fev')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('labels the y axis from min to max using valueFormatter, defaulting to String', () => {
    render(<AreaChart points={POINTS} />);

    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('applies a custom valueFormatter to the y labels', () => {
    render(<AreaChart points={POINTS} valueFormatter={(v) => `${v} kWh`} />);

    expect(screen.getByText('75 kWh')).toBeInTheDocument();
  });

  it('mutes the labels with neutral 400', () => {
    render(<AreaChart points={POINTS} />);

    expect(screen.getByText('Jan').style.color).toBe('var(--color-neutral-400)');
  });

  it('is an image whose label lists every point through valueFormatter', () => {
    render(<AreaChart points={POINTS} valueFormatter={(v) => `${v}!`} />);

    expect(screen.getByRole('img', { name: 'Jan 50!, Fev 75!, Mar 25!' })).toBeInTheDocument();
  });

  it('uses the height prop for the plot area and defaults to 180', () => {
    const { rerender } = render(<AreaChart points={POINTS} testID="chart" />);
    expect(screen.getByTestId('chart-plot').style.height).toBe('180px');

    rerender(<AreaChart points={POINTS} height={240} testID="chart" />);
    expect(screen.getByTestId('chart-plot').style.height).toBe('240px');
  });
});
