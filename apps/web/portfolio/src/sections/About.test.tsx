import { render, screen, within } from '@testing-library/react';
import { CONTACT } from '../content/contact';
import { EXPERIENCE } from '../content/experience';
import { STACK } from '../content/stack';
import { mockWideScreen } from '../test-utils';
import { About } from './About';

describe('About', () => {
  it('introduces Carlos with his photo, availability, stack and experience', () => {
    mockWideScreen(true);
    render(<About />);
    const section = screen.getByRole('region', { name: 'Sobre mim' });

    expect(section).toHaveAttribute('id', 'sobre');
    expect(section.querySelector('img')).toHaveAttribute('alt', '');
    expect(within(section).queryByRole('img', { name: /Carlos Vuotto/ })).not.toBeInTheDocument();
    expect(within(section).getByText('Disponível para novos projetos')).toBeInTheDocument();
    for (const tool of STACK) {
      expect(within(section).getByText(tool)).toBeInTheDocument();
    }
    for (const job of EXPERIENCE) {
      const row = within(section).getByTestId(`experience-${job.company}`);
      expect(row).toHaveTextContent(job.company);
      expect(row).toHaveTextContent(job.period);
      expect(row).toHaveTextContent(job.description);
    }
  });

  it('links to LinkedIn and GitHub in a new tab', () => {
    mockWideScreen(true);
    render(<About />);

    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      CONTACT.linkedin,
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', CONTACT.github);
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('target', '_blank');
  });

  it.each([
    [true, 'minmax(0, 1fr) minmax(0, 1.6fr)'],
    [false, 'minmax(0, 1fr)'],
  ])('lays the profile out for the screen (wide: %s)', (isWide, columns) => {
    mockWideScreen(isWide);
    render(<About />);

    expect(screen.getByTestId('about-grid').style.gridTemplateColumns).toBe(columns);
  });
});
