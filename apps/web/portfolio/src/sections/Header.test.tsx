import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { WHATSAPP_URL } from '../content/contact';
import { mockWideScreen } from '../test-utils';
import { Header } from './Header';

describe('Header', () => {
  it('offers a skip link straight to the content', () => {
    mockWideScreen(true);
    render(<Header />);

    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute(
      'href',
      '#conteudo',
    );
  });

  it('brings the skip link into view only while it has keyboard focus', () => {
    mockWideScreen(true);
    render(<Header />);
    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' });

    expect(skip.style.top).toBe('-100px');
    act(() => skip.focus());
    expect(skip.style.top).toBe('var(--space-4)');
    act(() => skip.blur());
    expect(skip.style.top).toBe('-100px');
  });

  it('shows the brand, the four section links and the WhatsApp action on a wide screen', () => {
    mockWideScreen(true);
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Principal' });

    expect(within(nav).getByText('Carlos Vuotto')).toBeInTheDocument();
    expect(
      ['Projetos', 'Serviços', 'Sobre', 'Dúvidas'].map((label) =>
        within(nav).getByRole('link', { name: label }).getAttribute('href'),
      ),
    ).toEqual(['#projetos', '#servicos', '#sobre', '#duvidas']);
    const action = within(nav).getByRole('link', { name: 'Vamos conversar' });
    expect(action).toHaveAttribute('href', WHATSAPP_URL);
    expect(action).toHaveAttribute('target', '_blank');
  });

  it.each([true, false])('turns the brand into a link back to the start (wide: %s)', (wide) => {
    mockWideScreen(wide);
    render(<Header />);
    const brand = within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('link', {
      name: 'Carlos Vuotto',
    });

    expect(brand).toHaveAttribute('href', '#conteudo');
    expect(brand.style.minHeight).toBe('var(--tap)');
  });

  it('puts the section links behind a menu button on a narrow screen', () => {
    mockWideScreen(false);
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Principal' });

    expect(within(nav).queryByRole('link', { name: 'Projetos' })).not.toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Vamos conversar' })).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole('button', { name: 'Abrir menu' }));
    expect(
      ['Projetos', 'Serviços', 'Sobre', 'Dúvidas'].map((label) =>
        within(nav).getByRole('link', { name: label }).getAttribute('href'),
      ),
    ).toEqual(['#projetos', '#servicos', '#sobre', '#duvidas']);
  });
});
