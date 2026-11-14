import { render, screen } from '@testing-library/react';
import { StatTile } from './StatTile';

describe('StatTile', () => {
  it('renders the value and the label', () => {
    render(<StatTile value="48 kWh" label="Uso em 24h" />);

    expect(screen.getByText('48 kWh')).toBeInTheDocument();
    expect(screen.getByText('Uso em 24h')).toBeInTheDocument();
  });

  it('draws the icon inside an accent 800 circle', () => {
    render(<StatTile icon={<span>icone</span>} value="1" label="x" testID="tile" />);
    const circle = screen.getByTestId('tile-icon');

    expect(circle).toContainElement(screen.getByText('icone'));
    expect(circle.style.width).toBe('var(--control-h-sm)');
    expect(circle.style.height).toBe('var(--control-h-sm)');
    expect(circle.style.borderRadius).toBe('var(--radius-pill)');
    expect(circle.style.background).toBe('var(--color-accent-800)');
  });

  it('lets a long value wrap inside the tile instead of overflowing', () => {
    render(<StatTile value="R$ 999.999.999,99" label="Saldo" testID="tile" />);

    const text = screen.getByText('R$ 999.999.999,99').parentElement;
    expect(text?.style.minWidth).toBe('0');
    expect(text?.style.overflowWrap).toBe('anywhere');
  });

  it('does not reserve the circle without an icon', () => {
    render(<StatTile value="1" label="x" testID="tile" />);

    expect(screen.queryByTestId('tile-icon')).not.toBeInTheDocument();
  });

  it('styles the value as a heading and mutes the label', () => {
    render(<StatTile value="48" label="Uso" />);

    const value = screen.getByText('48');
    expect(value.style.fontSize).toBe('var(--text-h4)');
    expect(value.style.fontWeight).toBe('var(--font-heading-weight)');
    expect(value.style.color).toBe('var(--color-text)');
    expect(screen.getByText('Uso').style.fontSize).toBe('var(--text-h6)');
    expect(screen.getByText('Uso').style.color).toBe('var(--color-neutral-400)');
  });
});
