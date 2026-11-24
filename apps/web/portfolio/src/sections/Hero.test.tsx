import { render, screen } from '@testing-library/react';
import { WHATSAPP_URL } from '../content/contact';
import { mockWideScreen } from '../test-utils';
import { Hero } from './Hero';

describe('Hero', () => {
  it('introduces Carlos in the page heading', () => {
    mockWideScreen(true);
    render(<Hero />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Olá! Sou o Carlos Vuotto, construindo experiências digitais.',
    );
  });

  it('leads to WhatsApp and to the projects', () => {
    mockWideScreen(true);
    render(<Hero />);
    const talk = screen.getByRole('link', { name: 'Vamos conversar' });

    expect(talk).toHaveAttribute('href', WHATSAPP_URL);
    expect(talk).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: 'Ver projetos' })).toHaveAttribute('href', '#projetos');
  });

  it('shows the photo', () => {
    mockWideScreen(true);
    render(<Hero />);

    expect(screen.getByRole('img', { name: /Carlos Vuotto/ })).toHaveAttribute(
      'src',
      '/carlos.webp',
    );
  });

  it('is visible from the first paint, without waiting for an entrance animation', () => {
    mockWideScreen(true);
    window.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    })) as unknown as typeof IntersectionObserver;
    render(<Hero />);

    expect(screen.getByRole('heading', { level: 1 }).closest('[style*="opacity: 0"]')).toBeNull();
    expect(screen.getByRole('img').closest('[style*="opacity: 0"]')).toBeNull();
    Reflect.deleteProperty(window, 'IntersectionObserver');
  });

  it.each([
    [true, 'minmax(0, 1.2fr) minmax(0, 1fr)'],
    [false, 'minmax(0, 1fr)'],
  ])('lays text and photo out for the screen (wide: %s)', (isWide, columns) => {
    mockWideScreen(isWide);
    render(<Hero />);

    expect(screen.getByTestId('hero-grid').style.gridTemplateColumns).toBe(columns);
  });
});
