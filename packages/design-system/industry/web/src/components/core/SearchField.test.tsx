import { fireEvent, render, screen } from '@testing-library/react';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('renders a search input with the default placeholder', () => {
    render(<SearchField />);

    expect(screen.getByPlaceholderText('Search')).toHaveAttribute('type', 'search');
  });

  it('draws the pill field with a control border', () => {
    render(<SearchField />);
    const input = screen.getByRole('searchbox');

    expect(input.style.borderRadius).toBe('var(--radius-pill)');
    expect(input.style.background).toBe('var(--color-surface)');
    expect(input.style.borderColor).toBe('var(--color-control-border)');
  });

  it('highlights the border while focused and forwards the handlers', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<SearchField onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByRole('searchbox');

    fireEvent.focus(input);
    expect(input.style.borderColor).toBe('var(--color-accent)');
    expect(onFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(input.style.borderColor).toBe('var(--color-control-border)');
    expect(onBlur).toHaveBeenCalled();
  });

  it('lifts the border on hover', () => {
    render(<SearchField />);
    const input = screen.getByRole('searchbox');

    fireEvent.mouseEnter(input);
    expect(input.style.borderColor).toBe('var(--color-neutral-500)');

    fireEvent.mouseLeave(input);
    expect(input.style.borderColor).toBe('var(--color-control-border)');
  });

  it('dims a disabled field', () => {
    render(<SearchField disabled />);

    expect(screen.getByRole('searchbox')).toBeDisabled();
    expect(screen.getByRole('searchbox').style.opacity).toBe('0.45');
  });
});
