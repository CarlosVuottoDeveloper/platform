import { fireEvent, render, screen } from '@testing-library/react';
import { Select } from './Select';

const OPTIONS = ['a', 'b'];

describe('Select', () => {
  it('renders every option', async () => {
    render(<Select label="Status" options={OPTIONS} />);

    expect(await screen.findByRole('option', { name: 'a' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'b' })).toBeInTheDocument();
  });

  it('renders object options by their label', async () => {
    render(<Select options={[{ value: 'grid', label: 'Grade' }]} />);

    expect(await screen.findByRole('option', { name: 'Grade' })).toBeInTheDocument();
  });

  it('associates the label with the select via htmlFor/id', async () => {
    render(<Select label="Status" options={OPTIONS} />);

    expect(await screen.findByLabelText('Status')).toBeInTheDocument();
  });

  it('calls onChange when a new option is picked', async () => {
    const onChange = jest.fn();
    render(<Select label="Status" options={OPTIONS} onChange={onChange} />);

    fireEvent.change(await screen.findByLabelText('Status'), { target: { value: 'b' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('renders the error message and marks the field as invalid', async () => {
    render(<Select label="Status" options={OPTIONS} error="Campo obrigatório" />);

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    expect(await screen.findByLabelText('Status')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders the hint when there is no error', async () => {
    render(<Select label="Status" options={OPTIONS} hint="Escolha um status" />);

    expect(await screen.findByText('Escolha um status')).toBeInTheDocument();
  });

  it('disables the select when disabled is set', async () => {
    render(<Select label="Status" options={OPTIONS} disabled />);

    expect(await screen.findByLabelText('Status')).toBeDisabled();
  });

  const frameOf = (select: HTMLElement) => select.parentElement as HTMLElement;

  it('draws the shared field frame around the select', async () => {
    render(<Select label="Status" options={OPTIONS} />);
    const frame = frameOf(await screen.findByLabelText('Status'));

    expect(frame.style.background).toBe('var(--color-surface)');
    expect(frame.style.borderRadius).toBe('var(--radius-md)');
    expect(frame.style.borderColor).toBe('var(--color-control-border)');
  });

  it('highlights the frame while focused and forwards the handlers', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<Select label="Status" options={OPTIONS} onFocus={onFocus} onBlur={onBlur} />);
    const select = await screen.findByLabelText('Status');

    fireEvent.focus(select);
    expect(frameOf(select).style.borderColor).toBe('var(--color-accent)');
    expect(onFocus).toHaveBeenCalled();

    fireEvent.blur(select);
    expect(frameOf(select).style.borderColor).toBe('var(--color-control-border)');
    expect(onBlur).toHaveBeenCalled();
  });

  it('lifts the frame border on hover', async () => {
    render(<Select label="Status" options={OPTIONS} />);
    const select = await screen.findByLabelText('Status');

    fireEvent.mouseEnter(select);
    expect(frameOf(select).style.borderColor).toBe('var(--color-neutral-500)');

    fireEvent.mouseLeave(select);
    expect(frameOf(select).style.borderColor).toBe('var(--color-control-border)');
  });

  it('uses the danger border when there is an error', async () => {
    render(<Select label="Status" options={OPTIONS} error="Campo obrigatório" />);

    expect(frameOf(await screen.findByLabelText('Status')).style.borderColor).toBe(
      'var(--color-danger)',
    );
  });

  it('paints the native option list on surface-2', async () => {
    render(<Select label="Status" options={OPTIONS} />);

    expect((await screen.findByRole('option', { name: 'a' })).style.background).toBe(
      'var(--color-surface-2)',
    );
  });
});
