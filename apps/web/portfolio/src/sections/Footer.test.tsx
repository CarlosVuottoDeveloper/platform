import { render, screen, within } from '@testing-library/react';
import { CONTACT, WHATSAPP_URL } from '../content/contact';
import { Footer } from './Footer';

describe('Footer', () => {
  it('signs the page with the name, the section links and the year', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');

    expect(within(footer).getByText('Carlos Vuotto', { selector: 'p' })).toBeInTheDocument();
    expect(
      ['Projetos', 'Serviços', 'Sobre', 'Dúvidas'].map((label) =>
        within(footer).getByRole('link', { name: label }).getAttribute('href'),
      ),
    ).toEqual(['#projetos', '#servicos', '#sobre', '#duvidas']);
    expect(
      within(footer).getByText(`© ${new Date().getFullYear()} Carlos Vuotto`),
    ).toBeInTheDocument();
  });

  it('links to LinkedIn, GitHub and WhatsApp with names and large touch targets', () => {
    render(<Footer />);

    for (const [name, href] of [
      ['LinkedIn de Carlos Vuotto', CONTACT.linkedin],
      ['GitHub de Carlos Vuotto', CONTACT.github],
      ['WhatsApp de Carlos Vuotto', WHATSAPP_URL],
    ]) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link.style.minWidth).toBe('44px');
      expect(link.style.minHeight).toBe('44px');
    }
  });
});
