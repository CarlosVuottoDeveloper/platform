import { render, screen } from '@testing-library/react';
import { money } from '../../test-utils';
import { PieTotal } from './PieTotal';

describe('PieTotal', () => {
  it('labels the total and formats it as money', () => {
    render(<PieTotal cents={148674} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText(money('R$ 1.486,74'))).toBeInTheDocument();
  });

  it('stays inside the hole of the pie, wrapping a large total', () => {
    render(<PieTotal cents={9999999999} />);

    const value = screen.getByText(money('R$ 99.999.999,99'));
    const box = value.parentElement as HTMLElement;
    expect(box.style.maxWidth).toBe('48%');
    expect(box.style.textAlign).toBe('center');
    expect(value.style.overflowWrap).toBe('anywhere');
  });
});
