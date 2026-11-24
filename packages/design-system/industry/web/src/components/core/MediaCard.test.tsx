import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MediaCard } from './MediaCard';

const IMAGE = { src: '/projects/jb.webp', alt: 'Página inicial do site Barbearia JB' };

function preferReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as typeof window.matchMedia;
}

describe('MediaCard', () => {
  beforeEach(() => preferReducedMotion(false));

  it('shows the image, kicker, title and body', () => {
    render(<MediaCard image={IMAGE} kicker="Barbearia" title="Barbearia JB" body="Agendamento" />);
    const image = screen.getByRole('img', { name: IMAGE.alt });

    expect(image).toHaveAttribute('src', IMAGE.src);
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image.style.aspectRatio).toBe('16 / 10');
    expect(image.style.objectFit).toBe('cover');
    expect(screen.getByText('Barbearia')).toBeInTheDocument();
    expect(screen.getByText('Barbearia JB')).toBeInTheDocument();
    expect(screen.getByText('Agendamento')).toBeInTheDocument();
  });

  it('turns the whole card into a link that opens the site in a new tab', async () => {
    render(<MediaCard image={IMAGE} title="Barbearia JB" href="https://barbeariajb1.com/" />);
    const link = screen.getByRole('link', { name: /Barbearia JB/ });

    expect(link).toHaveAttribute('href', 'https://barbeariajb1.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toContainElement(screen.getByRole('img', { name: IMAGE.alt }));
    await waitFor(() => expect(link.querySelectorAll('svg')).toHaveLength(1));
  });

  it('is not a link without an address', () => {
    render(<MediaCard image={IMAGE} title="Barbearia JB" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('wraps a long title inside the card', () => {
    render(<MediaCard image={IMAGE} title={'NomeMuitoLongoSemEspacos'.repeat(4)} />);

    expect(screen.getByText(/NomeMuitoLongo/).style.overflowWrap).toBe('anywhere');
  });

  it('lifts on hover and settles back when the pointer leaves', () => {
    render(<MediaCard image={IMAGE} title="Barbearia JB" testID="card" />);
    const card = screen.getByTestId('card');

    fireEvent.mouseEnter(card);
    expect(card.style.transform).toBe('translateY(-4px)');
    fireEvent.mouseLeave(card);
    expect(card.style.transform).toBe('');
  });

  it('stays still on hover for someone who prefers reduced motion', () => {
    preferReducedMotion(true);
    render(<MediaCard image={IMAGE} title="Barbearia JB" testID="card" />);
    const card = screen.getByTestId('card');

    fireEvent.mouseEnter(card);
    expect(card.style.transform).toBe('');
    expect(card.style.transition).toBe('');
  });
});
