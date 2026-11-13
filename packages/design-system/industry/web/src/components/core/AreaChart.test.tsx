import { render, screen } from '@testing-library/react';
import { AreaChart, buildAreaPath, selectLabelIndexes } from './AreaChart';

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
  it('insets the plot by 4px, the --space-1 step', () => {
    const ys = buildAreaPath(POINTS, 200, 100)
      .line.match(/-?\d+(\.\d+)?/g)!
      .map(Number)
      .filter((_, i) => i % 2 === 1);
    expect(Math.min(...ys)).toBe(4);
    expect(Math.max(...ys)).toBe(96);
  });

  it('renders only the grid for an empty list, without error', () => {
    render(<AreaChart points={[]} testID="chart" />);

    expect(screen.getByTestId('chart-grid-0')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-line')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chart-area')).not.toBeInTheDocument();
    expect(document.querySelector('linearGradient')).toBeNull();
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

  it('formats the y ticks with at most one decimal in pt-BR by default', () => {
    render(
      <AreaChart
        points={[
          { label: 'a', value: 40 },
          { label: 'b', value: 110 },
        ]}
      />,
    );

    expect(screen.getByText('86,7')).toBeInTheDocument();
    expect(screen.getByText('63,3')).toBeInTheDocument();
  });

  it('hands a custom valueFormatter the exact tick values', () => {
    render(
      <AreaChart
        points={[
          { label: 'a', value: 0.02 },
          { label: 'b', value: 0.04 },
        ]}
        valueFormatter={(v) => v.toFixed(3)}
      />,
    );

    for (const label of ['0.040', '0.033', '0.027', '0.020'])
      expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders every label of a series with repeated labels', () => {
    const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((label, i) => ({ label, value: i }));
    render(<AreaChart points={days} />);

    expect(screen.getAllByText('S')).toHaveLength(3);
    expect(screen.getAllByText('Q')).toHaveLength(2);
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

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5,3')).toBeInTheDocument();
  });

  it('shows at most 7 x labels for 30 points, keeping first and last', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ label: `d${i}`, value: i }));
    render(<AreaChart points={many} />);

    expect(screen.getAllByText(/^d\d+$/)).toHaveLength(7);
    expect(screen.getByText('d0')).toBeInTheDocument();
    expect(screen.getByText('d29')).toBeInTheDocument();
  });

  it('centres a single point label inside the plot', () => {
    render(<AreaChart points={[{ label: 'Unico', value: 3 }]} />);
    const label = screen.getByText('Unico');

    expect(parseFloat(label.style.left)).toBeCloseTo(50 - 100 / 14);
    expect(parseFloat(label.style.width)).toBeCloseTo(100 / 7);
  });

  it('keeps the first and last labels inside the plot', () => {
    render(<AreaChart points={POINTS} />);

    expect(parseFloat(screen.getByText('Jan').style.left)).toBe(0);
    expect(parseFloat(screen.getByText('Mar').style.left)).toBeCloseTo(100 - 100 / 7);
  });

  it('is not an image and has no label without points', () => {
    render(<AreaChart points={[]} testID="chart" />);

    const chart = screen.getByTestId('chart');
    expect(chart).not.toHaveAttribute('role');
    expect(chart).not.toHaveAttribute('aria-label');
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

  describe('non-finite values', () => {
    const WITH_NAN = [
      { label: 'Seg', value: 3 },
      { label: 'Ter', value: NaN },
      { label: 'Qua', value: 5 },
    ];

    it('keeps every x slot and label, leaving a gap at the bad point', () => {
      render(<AreaChart testID="c" points={WITH_NAN} />);
      const line = screen.getByTestId('c-line').getAttribute('d') as string;

      expect(line).not.toContain('NaN');
      expect(line.match(/M/g)).toHaveLength(2);
      expect(numbersIn(line)).toEqual(expect.arrayContaining([0, 100]));
      expect(screen.getByTestId('c-area').getAttribute('d')).not.toContain('NaN');
      expect(screen.getByText('Seg')).toBeTruthy();
      expect(screen.getByText('Ter')).toBeTruthy();
      expect(screen.getByText('Qua')).toBeTruthy();
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    });

    it('says "sem dado" for the missing point in the accessible label', () => {
      render(<AreaChart testID="c" points={WITH_NAN} />);

      expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Seg 3, Ter sem dado, Qua 5');
    });

    it('excludes the bad value from the y scale only', () => {
      render(<AreaChart testID="c" points={WITH_NAN} />);

      expect(screen.getByText('5')).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('draws a lone point between gaps as a dot', () => {
      const { line } = buildAreaPath(
        [{ value: 1 }, { value: NaN }, { value: 2 }, { value: NaN }, { value: 3 }],
        100,
        100,
      );

      expect(line.match(/M/g)).toHaveLength(3);
      expect(line).not.toContain('NaN');
    });

    it('closes the area once per segment', () => {
      const { area } = buildAreaPath(
        [{ value: 1 }, { value: 2 }, { value: NaN }, { value: 3 }, { value: 4 }],
        100,
        100,
      );

      expect(area.match(/Z/g)).toHaveLength(2);
    });

    it('treats Infinity like a missing value', () => {
      render(
        <AreaChart
          testID="c"
          points={[
            { label: 'A', value: Infinity },
            { label: 'B', value: 2 },
            { label: 'C', value: -Infinity },
          ]}
        />,
      );

      expect(screen.getByTestId('c-line').getAttribute('d')).not.toMatch(/NaN|Infinity/);
      expect(screen.queryByText(/Infinity|NaN/)).not.toBeInTheDocument();
    });

    it('renders like an empty chart when no value is finite', () => {
      render(<AreaChart testID="c" points={[{ label: 'A', value: NaN }]} />);

      expect(screen.queryByTestId('c-line')).not.toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  it('does not build the default number format until a chart renders', () => {
    const NumberFormat = jest.spyOn(Intl, 'NumberFormat');
    jest.isolateModules(() => {
      jest.requireActual('./AreaChart');
    });
    expect(NumberFormat).not.toHaveBeenCalled();
    NumberFormat.mockRestore();
  });
});
