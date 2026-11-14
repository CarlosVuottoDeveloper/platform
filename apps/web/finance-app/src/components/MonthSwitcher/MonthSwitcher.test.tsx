import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthSwitcher } from './MonthSwitcher';

describe('MonthSwitcher', () => {
  it('shows the month name and year without "de"', () => {
    render(<MonthSwitcher month="2026-03" onChange={jest.fn()} />);

    expect(screen.getByText('Março 2026')).toBeInTheDocument();
  });

  it('sits in a surface pill', () => {
    render(<MonthSwitcher month="2026-03" onChange={jest.fn()} />);

    const pill = screen.getByText('Março 2026').parentElement;
    expect(pill?.style.background).toBe('var(--color-surface)');
    expect(pill?.style.borderRadius).toBe('var(--radius-pill)');
  });

  it('moves one month back and forward across the year boundary', async () => {
    const onChange = jest.fn();
    render(<MonthSwitcher month="2026-12" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(onChange).toHaveBeenNthCalledWith(1, '2027-01');
    expect(onChange).toHaveBeenNthCalledWith(2, '2026-11');
  });
});
