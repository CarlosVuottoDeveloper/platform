import { fireEvent, render, screen } from '@testing-library/react';
import { ListRow } from './ListRow';

describe('ListRow', () => {
  it('renders title, meta, lead and trail', () => {
    render(
      <ListRow lead={<span>lead</span>} title="Título" meta="Meta" trail={<span>trail</span>} />,
    );

    expect(screen.getByText('lead')).toBeInTheDocument();
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Meta')).toBeInTheDocument();
    expect(screen.getByText('trail')).toBeInTheDocument();
  });

  it('renders as a button by default', () => {
    render(<ListRow title="Título" />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as a different element via the as prop', () => {
    render(<ListRow as="a" href="/x" title="Título" />);

    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('calls onClick when pressed', () => {
    const onClick = jest.fn();
    render(<ListRow title="Título" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });

  it('omits meta when not provided', () => {
    render(<ListRow title="Só título" />);

    expect(screen.getByText('Só título')).toBeInTheDocument();
  });

  it('is a flat transparent row with a straight divider', () => {
    render(<ListRow title="Título" />);

    const row = screen.getByRole('button');
    expect(row).toHaveStyle({
      borderBottom: '1px solid var(--color-divider)',
      borderLeftWidth: '0',
      borderRightWidth: '0',
      borderTopWidth: '0',
    });
    expect(row.style.borderRadius).toBe('');
    expect(row.style.background).toBe('none');
  });

  it('tints the row while hovered', () => {
    render(<ListRow title="Título" />);
    const row = screen.getByRole('button');

    fireEvent.mouseEnter(row);

    expect(row.style.background).toBe('color-mix(in srgb, var(--color-text) 5%, transparent)');
  });
});
