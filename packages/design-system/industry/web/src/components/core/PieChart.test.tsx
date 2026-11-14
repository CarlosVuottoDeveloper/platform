import { fireEvent, render, screen } from '@testing-library/react';
import { PieChart, resolvePercents, resolveSliceDash } from './PieChart';

const SLICES = [
  { label: 'Alimentação', value: 500, color: 'var(--viz-1)' },
  { label: 'Moradia', value: 300, color: 'var(--viz-2)' },
  { label: 'Lazer', value: 200, color: 'var(--viz-3)' },
];

describe('resolvePercents', () => {
  it('gives each slice its share', () => {
    expect(resolvePercents([500, 300, 200])).toEqual([50, 30, 20]);
  });

  it('always adds up to 100 when rounding would not', () => {
    const thirds = resolvePercents([1, 1, 1]);

    expect(thirds.reduce((sum, percent) => sum + percent, 0)).toBe(100);
    expect(thirds).toEqual([34, 33, 33]);
  });

  it('returns zeros when there is nothing to share', () => {
    expect(resolvePercents([0, 0])).toEqual([0, 0]);
    expect(resolvePercents([])).toEqual([]);
  });
});

describe('resolveSliceDash', () => {
  it('starts each slice where the previous ones end', () => {
    const circumference = 2 * Math.PI * 70;
    const second = resolveSliceDash([500, 300, 200], 1);

    expect(second.dasharray).toBe(`${0.3 * circumference} ${circumference}`);
    expect(second.dashoffset).toBeCloseTo(-0.5 * circumference);
  });

  it('draws nothing when the total is zero', () => {
    expect(resolveSliceDash([0, 0], 0).dasharray.startsWith('0 ')).toBe(true);
  });
});

describe('PieChart', () => {
  it('draws one arc per slice and a legend with value and share', () => {
    render(<PieChart slices={SLICES} testID="pie" />);

    expect(screen.getByTestId('pie').querySelectorAll('circle[data-slice]')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Alimentação: 500, 50%' })).toBeInTheDocument();
    expect(screen.getByText('300 · 30%')).toBeInTheDocument();
  });

  it('describes the chart for assistive technology', () => {
    render(<PieChart slices={SLICES} />);

    expect(
      screen.getByRole('img', { name: 'Alimentação 50%, Moradia 30%, Lazer 20%' }),
    ).toBeInTheDocument();
  });

  it('formats values and can show only the share', () => {
    render(
      <PieChart slices={SLICES} valueFormatter={(value) => `R$ ${value}`} legendValue="percent" />,
    );

    expect(screen.getByRole('button', { name: 'Moradia: R$ 300, 30%' })).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.queryByText(/R\$ 300 ·/)).not.toBeInTheDocument();
  });

  it('highlights a slice from the legend and clears it on a second press', () => {
    render(<PieChart slices={SLICES} testID="pie" />);
    const arcs = () => [...screen.getByTestId('pie').querySelectorAll('circle[data-slice]')];

    fireEvent.click(screen.getByRole('button', { name: /Moradia/ }));
    expect(arcs().map((arc) => arc.getAttribute('stroke-opacity'))).toEqual(['0.35', '1', '0.35']);
    expect(screen.getByRole('button', { name: /Moradia/ })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Moradia/ }));
    expect(arcs().map((arc) => arc.getAttribute('stroke-opacity'))).toEqual(['1', '1', '1']);
  });

  it('renders a neutral ring instead of arcs when there is no data', () => {
    render(<PieChart slices={[]} testID="pie" />);

    expect(screen.getByTestId('pie').querySelectorAll('circle[data-slice]')).toHaveLength(0);
    expect(screen.getByTestId('pie').querySelectorAll('circle')).toHaveLength(1);
  });

  it('treats negative and non-finite values as zero', () => {
    render(
      <PieChart
        slices={[
          { label: 'A', value: 100, color: 'var(--viz-1)' },
          { label: 'B', value: -50, color: 'var(--viz-2)' },
          { label: 'C', value: Number.NaN, color: 'var(--viz-3)' },
        ]}
      />,
    );

    expect(screen.getByRole('img', { name: 'A 100%, B 0%, C 0%' })).toBeInTheDocument();
  });

  it('places the legend beside the donut and shows a centre label', () => {
    render(
      <PieChart
        slices={SLICES}
        legendPlacement="right"
        centerLabel={<span>Total</span>}
        testID="pie"
      />,
    );

    expect(screen.getByTestId('pie')).toHaveStyle({ flexDirection: 'row' });
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
