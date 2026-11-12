import { fireEvent, render, screen } from '@testing-library/react';
import {
  DatePicker,
  buildMonthMatrix,
  formatDate,
  isDateDisabled,
  isSameDay,
  startOfDay,
} from './DatePicker';

describe('pure date helpers', () => {
  it('startOfDay strips the time portion', () => {
    expect(startOfDay(new Date(2026, 7, 26, 13, 45))).toEqual(new Date(2026, 7, 26, 0, 0, 0, 0));
  });

  it('isSameDay compares calendar day, ignoring time', () => {
    expect(isSameDay(new Date(2026, 7, 26, 1), new Date(2026, 7, 26, 23))).toBe(true);
    expect(isSameDay(new Date(2026, 7, 26), new Date(2026, 7, 27))).toBe(false);
  });

  it('isDateDisabled rejects dates before min or after max', () => {
    const min = new Date(2026, 7, 10);
    const max = new Date(2026, 7, 20);
    expect(isDateDisabled(new Date(2026, 7, 9), min, max)).toBe(true);
    expect(isDateDisabled(new Date(2026, 7, 21), min, max)).toBe(true);
    expect(isDateDisabled(new Date(2026, 7, 15), min, max)).toBe(false);
    expect(isDateDisabled(new Date(2026, 7, 15))).toBe(false);
  });

  it('formatDate renders pt-BR dd/mm/yyyy', () => {
    expect(formatDate(new Date(2026, 7, 26))).toBe('26/08/2026');
  });

  it('buildMonthMatrix pads leading/trailing cells to full weeks', () => {
    const cells = buildMonthMatrix(2026, 7);
    expect(cells.length % 7).toBe(0);
    const days = cells.filter((c): c is Date => c !== null);
    expect(days).toHaveLength(31);
    expect(days[0]?.getDate()).toBe(1);
    expect(days[days.length - 1]?.getDate()).toBe(31);
  });
});

describe('DatePicker', () => {
  it('shows the placeholder when there is no value', async () => {
    render(<DatePicker placeholder="Escolha" />);
    expect(await screen.findByRole('button', { name: /Escolha/ })).toBeInTheDocument();
  });

  it('shows the formatted value when set', async () => {
    render(<DatePicker value={new Date(2026, 7, 26)} />);
    expect(await screen.findByRole('button', { name: /26\/08\/2026/ })).toBeInTheDocument();
  });

  it('is closed by default and opens when the trigger is clicked', async () => {
    render(<DatePicker />);
    const trigger = await screen.findByRole('button', { name: /Selecione uma data/ });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await screen.findByRole('button', { name: 'Próximo mês' });
  });

  it('does not open when disabled', async () => {
    render(<DatePicker disabled />);
    fireEvent.click(await screen.findByRole('button', { name: /Selecione uma data/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('selects a day, calls onChange, and closes the panel', async () => {
    const onChange = jest.fn();
    render(<DatePicker value={new Date(2026, 7, 26)} onChange={onChange} />);

    fireEvent.click(await screen.findByRole('button', { name: /26\/08\/2026/ }));
    await screen.findByRole('button', { name: 'Próximo mês' });
    fireEvent.click(screen.getByRole('button', { name: '15' }));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 15));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates to the next and previous month', async () => {
    render(<DatePicker value={new Date(2026, 7, 26)} />);
    fireEvent.click(await screen.findByRole('button', { name: /26\/08\/2026/ }));

    expect(screen.getByText('Agosto 2026')).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Próximo mês' }));
    expect(screen.getByText('Setembro 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(screen.getByText('Julho 2026')).toBeInTheDocument();
  });

  it('disables days outside the min/max range and ignores clicks on them', async () => {
    const onChange = jest.fn();
    render(
      <DatePicker
        value={new Date(2026, 7, 15)}
        onChange={onChange}
        min={new Date(2026, 7, 10)}
        max={new Date(2026, 7, 20)}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: /15\/08\/2026/ }));
    await screen.findByRole('button', { name: 'Próximo mês' });

    const disabledDay = screen.getByRole('button', { name: '5' });
    expect(disabledDay).toBeDisabled();
  });

  it('marks the selected day and today distinctly', async () => {
    render(<DatePicker value={new Date(2026, 7, 26)} />);
    fireEvent.click(await screen.findByRole('button', { name: /26\/08\/2026/ }));
    await screen.findByRole('button', { name: 'Próximo mês' });

    expect(screen.getByRole('button', { name: '26' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('tints the month-nav buttons and day cells while hovered', async () => {
    render(<DatePicker value={new Date(2026, 7, 26)} />);
    fireEvent.click(await screen.findByRole('button', { name: /26\/08\/2026/ }));
    const nextMonth = await screen.findByRole('button', { name: 'Próximo mês' });
    const day = screen.getByRole('button', { name: '15' });
    const tint = 'color-mix(in srgb, var(--color-text) 8%, transparent)';

    fireEvent.mouseEnter(nextMonth);
    fireEvent.mouseEnter(day);
    expect(nextMonth.style.background).toBe(tint);
    expect(day.style.background).toBe(tint);

    fireEvent.mouseLeave(nextMonth);
    fireEvent.mouseLeave(day);
    expect(nextMonth.style.background).toBe('transparent');
    expect(day.style.background).toBe('transparent');
  });

  it('draws the trigger in the shared field frame', async () => {
    render(<DatePicker label="Data" />);
    const trigger = (await screen.findByRole('button', { name: /Selecione uma data/ }))
      .firstElementChild as HTMLElement;

    expect(trigger.style.background).toBe('var(--color-surface)');
    expect(trigger.style.borderRadius).toBe('var(--radius-md)');
    expect(trigger.style.borderColor).toBe('var(--color-control-border)');
  });

  it('highlights the trigger while open, lifts it on hover and flags errors', async () => {
    const { rerender } = render(<DatePicker label="Data" />);
    const button = await screen.findByRole('button', { name: /Selecione uma data/ });
    const trigger = button.firstElementChild as HTMLElement;

    fireEvent.mouseEnter(trigger);
    expect(trigger.style.borderColor).toBe('var(--color-neutral-500)');
    fireEvent.mouseLeave(trigger);

    fireEvent.click(button);
    expect(trigger.style.borderColor).toBe('var(--color-accent)');

    rerender(<DatePicker label="Data" error="Obrigatório" />);
    expect(trigger.style.borderColor).toBe('var(--color-danger)');
  });

  it('fills the selected day with the accent and a bg-coloured label', async () => {
    render(<DatePicker value={new Date(2026, 7, 26)} />);
    fireEvent.click(await screen.findByRole('button', { name: /26\/08\/2026/ }));
    await screen.findByRole('button', { name: 'Próximo mês' });
    const selected = screen.getByRole('button', { name: '26' });

    expect(selected.style.background).toBe('var(--color-accent)');
    expect(selected.style.color).toBe('var(--color-bg)');
    expect(selected.style.borderRadius).toBe('var(--radius-pill)');
  });

  it('keeps every interactive cell at least one tap target wide', async () => {
    render(<DatePicker value={new Date(2026, 7, 26)} />);
    fireEvent.click(await screen.findByRole('button', { name: /26\/08\/2026/ }));
    const next = await screen.findByRole('button', { name: 'Próximo mês' });

    expect(next.style.minHeight).toBe('var(--tap)');
    expect(next.style.minWidth).toBe('var(--tap)');
    const grid = screen.getByRole('button', { name: '15' }).parentElement as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe('repeat(7, minmax(var(--tap), 1fr))');
    expect((screen.getByRole('dialog').firstElementChild as HTMLElement).style.width).toBe('');
  });

  it('renders label, hint and error', async () => {
    const { rerender } = render(<DatePicker label="Data" hint="dd/mm/aaaa" />);
    expect(await screen.findByText('Data')).toBeInTheDocument();
    expect(screen.getByText('dd/mm/aaaa')).toBeInTheDocument();

    rerender(<DatePicker label="Data" error="Obrigatório" />);
    expect(screen.getByText('Obrigatório')).toBeInTheDocument();
  });

  it('shows no hover state on a disabled trigger', async () => {
    render(<DatePicker label="Data" disabled />);
    const trigger = (await screen.findByRole('button', { name: /Selecione uma data/ }))
      .firstElementChild as HTMLElement;

    fireEvent.mouseEnter(trigger);

    expect(trigger.style.borderColor).toBe('var(--color-control-border)');
  });
});
