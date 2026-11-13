import { fireEvent, render, screen } from '@testing-library/react';
import { TextField } from './TextField';

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Nome" />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('renders the field in the shared frame', () => {
    render(<TextField label="Nome" />);
    const input = screen.getByLabelText('Nome');

    expect(input.style.background).toBe('var(--color-surface)');
    expect(input.style.borderRadius).toBe('var(--radius-md)');
    expect(input.style.borderColor).toBe('var(--color-control-border)');
  });

  it('highlights the border while focused and restores it on blur', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<TextField label="Nome" onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByLabelText('Nome');

    fireEvent.focus(input);
    expect(input.style.borderColor).toBe('var(--color-accent)');
    expect(onFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(input.style.borderColor).toBe('var(--color-control-border)');
    expect(onBlur).toHaveBeenCalled();
  });

  it('lifts the border on hover', () => {
    render(<TextField label="Nome" />);
    const input = screen.getByLabelText('Nome');

    fireEvent.mouseEnter(input);
    expect(input.style.borderColor).toBe('var(--color-neutral-500)');

    fireEvent.mouseLeave(input);
    expect(input.style.borderColor).toBe('var(--color-control-border)');
  });

  it('marks the field invalid and shows the error in the danger colour', () => {
    render(<TextField label="Nome" error="Obrigatório" />);
    const input = screen.getByLabelText('Nome');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', screen.getByText('Obrigatório').id);
    expect(input.style.borderColor).toBe('var(--color-danger)');
    expect(screen.getByText('Obrigatório').style.color).toBe('var(--color-danger-300)');
  });

  it('shows the hint when there is no error', () => {
    render(<TextField label="Nome" hint="Como no documento" />);

    expect(screen.getByLabelText('Nome')).toHaveAttribute(
      'aria-describedby',
      screen.getByText('Como no documento').id,
    );
  });

  it('renders a textarea when multiline', () => {
    render(<TextField label="Notas" multiline rows={5} />);
    const area = screen.getByLabelText('Notas');

    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAttribute('rows', '5');
    expect(area.style.borderRadius).toBe('var(--radius-md)');
  });

  it('dims and disables the field', () => {
    render(<TextField label="Nome" disabled />);

    expect(screen.getByLabelText('Nome')).toBeDisabled();
    expect(screen.getByLabelText('Nome').style.opacity).toBe('0.45');
  });
});
