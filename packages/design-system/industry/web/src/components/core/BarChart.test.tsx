import { render, screen } from '@testing-library/react';
import { BarChart } from './BarChart';

const SERIES = [
  { label: 'Receitas', color: 'var(--viz-3)' },
  { label: 'Despesas', color: 'var(--viz-5)' },
];
const GROUPS = [
  { label: 'Jan', values: [4000, 3000] },
  { label: 'Fev', values: [5000, 2500] },
  { label: 'Mar', values: [4500, 5000] },
];

const barHeight = (group: number, series: number) =>
  screen.getByTestId(`bars-bar-${group}-${series}`).style.height;

describe('BarChart', () => {
  it('draws one bar per series in every group', () => {
    render(<BarChart series={SERIES} groups={GROUPS} testID="bars" />);

    expect(screen.getByTestId('bars').querySelectorAll('[data-bar]')).toHaveLength(6);
  });

  it('scales bars against the largest value', () => {
    render(<BarChart series={SERIES} groups={GROUPS} testID="bars" />);

    expect(barHeight(1, 0)).toBe('100%');
    expect(barHeight(2, 1)).toBe('100%');
    expect(barHeight(0, 1)).toBe('60%');
    expect(barHeight(1, 1)).toBe('50%');
  });

  it('labels every group and lists the series in a legend', () => {
    render(<BarChart series={SERIES} groups={GROUPS} />);

    expect(screen.getByText('Fev')).toBeInTheDocument();
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
  });

  it('describes the chart for assistive technology using the formatter', () => {
    render(
      <BarChart
        series={SERIES}
        groups={GROUPS.slice(0, 1)}
        valueFormatter={(value) => `R$ ${value}`}
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Jan: Receitas R$ 4000, Despesas R$ 3000' }),
    ).toBeInTheDocument();
  });

  it('treats negative, missing and non-finite values as zero', () => {
    render(
      <BarChart
        series={SERIES}
        groups={[
          { label: 'Jan', values: [-100, Number.NaN] },
          { label: 'Fev', values: [200] },
        ]}
        testID="bars"
      />,
    );

    expect(barHeight(0, 0)).toBe('0%');
    expect(barHeight(0, 1)).toBe('0%');
    expect(barHeight(1, 0)).toBe('100%');
    expect(barHeight(1, 1)).toBe('0%');
  });

  it('renders without bars or a description when there is no data', () => {
    render(<BarChart series={SERIES} groups={[]} testID="bars" />);

    expect(screen.getByTestId('bars').querySelectorAll('[data-bar]')).toHaveLength(0);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps every bar at zero height when all values are zero', () => {
    render(<BarChart series={SERIES} groups={[{ label: 'Jan', values: [0, 0] }]} testID="bars" />);

    expect(barHeight(0, 0)).toBe('0%');
  });
});
