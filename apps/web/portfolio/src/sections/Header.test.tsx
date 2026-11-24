import { render, screen, within } from '@testing-library/react';
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

  it('keeps only the brand and the action on a narrow screen', () => {
    mockWideScreen(false);
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Principal' });

    expect(within(nav).queryByRole('link', { name: 'Projetos' })).not.toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Vamos conversar' })).toBeInTheDocument();
  });
});
