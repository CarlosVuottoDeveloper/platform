import { render, screen } from '@testing-library/react';
import { DotGrid, dotLevel } from './DotGrid';

describe('dotLevel', () => {
  it('splits 0–1 into four levels', () => {
    expect([0, 0.2, 0.34, 0.5, 0.67, 1].map(dotLevel)).toEqual([0, 1, 2, 2, 3, 3]);
  });

  it('clamps values out of range and treats non-finite values as empty', () => {
    expect([-1, 2, Number.NaN, Number.POSITIVE_INFINITY].map(dotLevel)).toEqual([0, 3, 0, 0]);
  });
});

describe('DotGrid', () => {
  const values = [0, 0.2, 0.5, 1, Number.NaN, 0.9];

  it('draws one dot per value at its level, in the given number of columns', () => {
    render(<DotGrid values={values} columns={3} testID="grid" />);

    const dots = screen.getByTestId('grid-dots');
    expect(dots).toHaveStyle({ gridTemplateColumns: 'repeat(3, 1fr)' });
    expect([...dots.children].map((dot) => dot.getAttribute('data-level'))).toEqual([
      '0',
      '1',
      '2',
      '3',
      '0',
      '3',
    ]);
  });

  it('shows a legend from the lowest to the highest level when asked', () => {
    render(
      <DotGrid values={values} columns={3} legend={{ low: 'menos', high: 'mais' }} testID="grid" />,
    );

    const legend = screen.getByTestId('grid-legend');
    expect(legend).toHaveTextContent(/^menos.*mais$/);
    expect(
      [...legend.querySelectorAll('[data-level]')].map((dot) => dot.getAttribute('data-level')),
    ).toEqual(['0', '1', '2', '3']);
  });

  it('has no legend unless asked', () => {
    render(<DotGrid values={values} columns={3} testID="grid" />);

    expect(screen.queryByTestId('grid-legend')).not.toBeInTheDocument();
  });

  it('is an image with a name when labelled', () => {
    render(<DotGrid values={values} columns={3} label="Gastos por dia" testID="grid" />);

    expect(screen.getByRole('img', { name: 'Gastos por dia' })).toBe(
      screen.getByTestId('grid-dots'),
    );
  });

  it('is hidden from assistive technology when it has no label', () => {
    render(<DotGrid values={values} columns={3} testID="grid" />);

    expect(screen.getByTestId('grid-dots')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
