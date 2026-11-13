import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthSwitcher } from './MonthSwitcher';

describe('MonthSwitcher', () => {
  it('shows the month in sentence case', () => {
    render(<MonthSwitcher month="2026-03" onChange={jest.fn()} />);

    expect(screen.getByText('Março de 2026')).toBeInTheDocument();
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
