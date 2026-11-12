import { fireEvent, render, screen } from '@testing-library/react';
import { Switch } from './Switch';

const trackOf = (input: HTMLElement) => input.nextElementSibling as HTMLElement;
const thumbOf = (input: HTMLElement) => trackOf(input).firstElementChild as HTMLElement;

describe('Switch', () => {
  it('toggles uncontrolled and calls onChange', () => {
    const onChange = jest.fn();
    render(<Switch label="Notificações" onChange={onChange} />);
    const input = screen.getByRole('checkbox', { name: 'Notificações' });

    fireEvent.click(input);

    expect(input).toBeChecked();
    expect(onChange).toHaveBeenCalled();
  });

  it('draws the off track on surface-2 with a control border and a neutral thumb', () => {
    render(<Switch label="Notificações" />);
    const input = screen.getByRole('checkbox');

    expect(trackOf(input).style.background).toBe('var(--color-surface-2)');
    expect(trackOf(input).style.borderColor).toBe('var(--color-control-border)');
    expect(trackOf(input).style.borderRadius).toBe('var(--radius-pill)');
    expect(thumbOf(input).style.background).toBe('var(--color-neutral-400)');
    expect(thumbOf(input).style.borderRadius).toBe('var(--radius-pill)');
  });

  it('draws the on track in the deep accent with an accent thumb and no glow', () => {
    render(<Switch label="Notificações" defaultChecked />);
    const input = screen.getByRole('checkbox');

    expect(trackOf(input).style.background).toBe('var(--color-accent-800)');
    expect(trackOf(input).style.borderColor).toBe('var(--color-accent-400)');
    expect(thumbOf(input).style.background).toBe('var(--color-accent)');
    expect(trackOf(input).style.boxShadow).toBe('');
    expect(thumbOf(input).style.boxShadow).toBe('');
  });

  it('follows the controlled checked prop', () => {
    const { rerender } = render(<Switch label="x" checked onChange={() => undefined} />);
    expect(trackOf(screen.getByRole('checkbox')).style.background).toBe('var(--color-accent-800)');

    rerender(<Switch label="x" checked={false} onChange={() => undefined} />);
    expect(trackOf(screen.getByRole('checkbox')).style.background).toBe('var(--color-surface-2)');
  });

  it('lifts the track border on hover', () => {
    render(<Switch label="Notificações" />);
    const input = screen.getByRole('checkbox');

    fireEvent.mouseEnter(screen.getByText('Notificações'));
    expect(trackOf(input).style.borderColor).toBe('var(--color-neutral-500)');

    fireEvent.mouseLeave(screen.getByText('Notificações'));
    expect(trackOf(input).style.borderColor).toBe('var(--color-control-border)');
  });

  it('shows a focus ring while focused', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<Switch label="Notificações" onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByRole('checkbox');

    fireEvent.focus(input);
    expect(trackOf(input).style.outline).toBe('2px solid var(--color-accent)');
    expect(onFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(trackOf(input).style.outline).toBe('none');
    expect(onBlur).toHaveBeenCalled();
  });

  it('dims a disabled switch', () => {
    render(<Switch label="Notificações" disabled />);

    expect(trackOf(screen.getByRole('checkbox')).style.opacity).toBe('0.45');
  });
});
