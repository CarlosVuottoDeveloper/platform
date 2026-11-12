import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { color, radii, semanticColor } from '@industry/tokens';
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
  it('shows the placeholder when there is no value', () => {
    render(<DatePicker placeholder="Escolha" testID="dp" />);
    expect(screen.getByTestId('dp').props.accessibilityLabel).toBe('Escolha');
  });

  it('shows the formatted value when set', () => {
    render(<DatePicker value={new Date(2026, 7, 26)} testID="dp" />);
    expect(screen.getByTestId('dp').props.accessibilityLabel).toBe('26/08/2026');
  });

  it('is closed by default and opens when the trigger is pressed', () => {
    render(<DatePicker testID="dp" />);
    expect(screen.queryByTestId('dp-panel')).toBeNull();

    fireEvent.press(screen.getByTestId('dp'));
    expect(screen.getByTestId('dp-panel')).toBeTruthy();
  });

  it('does not open when disabled', () => {
    render(<DatePicker disabled testID="dp" />);
    fireEvent.press(screen.getByTestId('dp'));
    expect(screen.queryByTestId('dp-panel')).toBeNull();
  });

  it('selects a day, calls onChange, and closes the panel', () => {
    const onChange = jest.fn();
    render(<DatePicker value={new Date(2026, 7, 26)} onChange={onChange} testID="dp" />);

    fireEvent.press(screen.getByTestId('dp'));
    fireEvent.press(screen.getByTestId('date-cell-2026-7-15'));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 15));
    expect(screen.queryByTestId('dp-panel')).toBeNull();
  });

  it('closes when the backdrop is pressed', () => {
    render(<DatePicker testID="dp" />);
    fireEvent.press(screen.getByTestId('dp'));
    fireEvent.press(screen.getByTestId('dp-backdrop'));
    expect(screen.queryByTestId('dp-panel')).toBeNull();
  });

  it('closes when the device back gesture requests it', () => {
    render(<DatePicker testID="dp" />);
    fireEvent.press(screen.getByTestId('dp'));
    fireEvent(screen.getByTestId('dp-backdrop').parent as never, 'requestClose');
    expect(screen.queryByTestId('dp-panel')).toBeNull();
  });

  it('navigates to the next and previous month', () => {
    render(<DatePicker value={new Date(2026, 7, 26)} testID="dp" />);
    fireEvent.press(screen.getByTestId('dp'));

    expect(screen.getByText('Agosto 2026')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Próximo mês'));
    expect(screen.getByText('Setembro 2026')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Mês anterior'));
    fireEvent.press(screen.getByLabelText('Mês anterior'));
    expect(screen.getByText('Julho 2026')).toBeTruthy();
  });

  it('disables days outside the min/max range and ignores presses on them', () => {
    const onChange = jest.fn();
    render(
      <DatePicker
        value={new Date(2026, 7, 15)}
        onChange={onChange}
        min={new Date(2026, 7, 10)}
        max={new Date(2026, 7, 20)}
        testID="dp"
      />,
    );

    fireEvent.press(screen.getByTestId('dp'));
    fireEvent.press(screen.getByTestId('date-cell-2026-7-5'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('tints a nav button and a day cell while pressed', () => {
    render(<DatePicker value={new Date(2026, 7, 26)} testID="dp" />);
    fireEvent.press(screen.getByTestId('dp'));

    fireEvent(screen.getByLabelText('Próximo mês'), 'pressIn');
    fireEvent(screen.getByTestId('date-cell-2026-7-15'), 'pressIn');

    expect(screen.getByLabelText('Próximo mês').props.style).toMatchObject({
      backgroundColor: expect.any(String),
    });
    expect(screen.getByTestId('date-cell-2026-7-15').props.style).toMatchObject({
      backgroundColor: expect.any(String),
    });
  });

  it('outlines the trigger with the control border and a md radius', () => {
    render(<DatePicker testID="dp" />);
    expect(StyleSheet.flatten(screen.getByTestId('dp').props.style)).toMatchObject({
      borderColor: color.controlBorder,
      borderRadius: radii.md,
      backgroundColor: color.surface,
    });
  });

  it('turns the trigger border to danger on error', () => {
    render(<DatePicker testID="dp" error="x" />);
    expect(StyleSheet.flatten(screen.getByTestId('dp').props.style)).toMatchObject({
      borderColor: semanticColor.danger,
    });
  });

  it('rounds the panel and fills the selected day with the accent', () => {
    render(<DatePicker value={new Date(2026, 7, 26)} testID="dp" />);
    fireEvent.press(screen.getByTestId('dp'));

    expect(screen.getByTestId('dp-panel').props.style).toMatchObject({
      borderTopLeftRadius: radii.lg,
      borderTopRightRadius: radii.lg,
    });
    expect(StyleSheet.flatten(screen.getByTestId('date-cell-2026-7-26').props.style)).toMatchObject(
      {
        backgroundColor: color.accent,
        borderRadius: radii.pill,
      },
    );
    expect(screen.getByText('26', { includeHiddenElements: true }).props.style).toMatchObject({
      color: color.bg,
    });
  });

  it('renders label, hint and error', () => {
    const { rerender } = render(<DatePicker label="Data" hint="dd/mm/aaaa" />);
    expect(screen.getByText('Data')).toBeTruthy();
    expect(screen.getByText('dd/mm/aaaa')).toBeTruthy();

    rerender(<DatePicker label="Data" error="Obrigatório" />);
    expect(screen.getByText('Obrigatório')).toBeTruthy();
  });

  it('works without a testID', () => {
    render(<DatePicker value={new Date(2026, 7, 26)} />);
    expect(screen.getByText('26/08/2026')).toBeTruthy();
  });
});
