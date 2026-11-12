import { fireEvent, render, screen } from '@testing-library/react';
import { Checkbox } from './Checkbox';

const boxOf = (checkbox: HTMLElement) => checkbox.nextElementSibling as HTMLElement;

describe('Checkbox', () => {
  it('toggles uncontrolled and calls onChange', () => {
    const onChange = jest.fn();
    render(<Checkbox label="Aceito" onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Aceito' });

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenCalled();
  });

  it('draws the unchecked box with a small radius and a control border', () => {
    render(<Checkbox label="Aceito" />);
    const box = boxOf(screen.getByRole('checkbox'));

    expect(box.style.borderRadius).toBe('var(--radius-sm)');
    expect(box.style.borderColor).toBe('var(--color-control-border)');
    expect(box.style.background).toBe('transparent');
  });

  it('fills the box with the accent and a bg-coloured check when checked', () => {
    render(<Checkbox label="Aceito" defaultChecked />);
    const box = boxOf(screen.getByRole('checkbox'));
    const mark = box.firstElementChild as HTMLElement;

    expect(box.style.borderColor).toBe('var(--color-accent)');
    expect(box.style.background).toBe('var(--color-accent)');
    expect(mark.style.borderLeft).toBe('2px solid var(--color-bg)');
    expect(mark.style.opacity).toBe('1');
  });

  it('follows the controlled checked prop', () => {
    const { rerender } = render(<Checkbox label="Aceito" checked onChange={() => undefined} />);
    expect(boxOf(screen.getByRole('checkbox')).style.background).toBe('var(--color-accent)');

    rerender(<Checkbox label="Aceito" checked={false} onChange={() => undefined} />);
    expect(boxOf(screen.getByRole('checkbox')).style.background).toBe('transparent');
  });

  it('accents the border on hover but not while disabled', () => {
    const { rerender } = render(<Checkbox label="Aceito" />);
    const label = screen.getByText('Aceito');

    fireEvent.mouseEnter(label);
    expect(boxOf(screen.getByRole('checkbox')).style.borderColor).toBe('var(--color-accent)');

    fireEvent.mouseLeave(label);
    expect(boxOf(screen.getByRole('checkbox')).style.borderColor).toBe(
      'var(--color-control-border)',
    );

    rerender(<Checkbox label="Aceito" disabled />);
    fireEvent.mouseEnter(screen.getByText('Aceito'));
    expect(boxOf(screen.getByRole('checkbox')).style.borderColor).toBe(
      'var(--color-control-border)',
    );
  });

  it('shows a focus ring while the input is focused', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<Checkbox label="Aceito" onFocus={onFocus} onBlur={onBlur} />);
    const checkbox = screen.getByRole('checkbox');

    fireEvent.focus(checkbox);
    expect(boxOf(checkbox).style.outline).toBe('2px solid var(--color-accent)');
    expect(onFocus).toHaveBeenCalled();

    fireEvent.blur(checkbox);
    expect(boxOf(checkbox).style.outline).toBe('none');
    expect(onBlur).toHaveBeenCalled();
  });
});
