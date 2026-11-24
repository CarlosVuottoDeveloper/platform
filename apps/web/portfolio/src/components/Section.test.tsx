import { render, screen } from '@testing-library/react';
import { Section } from './Section';

describe('Section', () => {
  it('is a section named by its heading, reachable by its id', () => {
    render(
      <Section id="projetos" title="Projetos recentes" subtitle="Sites no ar">
        <p>Conteúdo</p>
      </Section>,
    );
    const section = screen.getByRole('region', { name: 'Projetos recentes' });

    expect(section).toHaveAttribute('id', 'projetos');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Projetos recentes' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sites no ar')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('leaves room for the sticky navigation when reached by an anchor', () => {
    render(
      <Section id="sobre" title="Sobre mim">
        x
      </Section>,
    );

    expect(screen.getByRole('region').style.scrollMarginTop).toBe(
      'calc(var(--control-h) + var(--space-12))',
    );
  });

  it('has no subtitle line when none is given', () => {
    render(
      <Section id="servicos" title="Serviços">
        x
      </Section>,
    );

    expect(screen.getByRole('region').querySelectorAll('p')).toHaveLength(0);
  });
});
