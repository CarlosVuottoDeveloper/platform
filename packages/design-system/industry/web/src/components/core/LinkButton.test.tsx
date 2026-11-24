import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { LinkButton } from './LinkButton';

const SHARED = ['background', 'borderRadius', 'minHeight', 'paddingLeft', 'paddingRight', 'color'];

describe('LinkButton', () => {
  it('is a link to the given address', () => {
    render(<LinkButton href="#projetos">Ver projetos</LinkButton>);

    expect(screen.getByRole('link', { name: 'Ver projetos' })).toHaveAttribute('href', '#projetos');
  });

  it.each([
    ['primary', 'md'],
    ['secondary', 'sm'],
  ] as const)('looks like a %s %s button', (variant, size) => {
    render(
      <>
        <Button variant={variant} size={size}>
          Botão
        </Button>
        <LinkButton href="#x" variant={variant} size={size}>
          Link
        </LinkButton>
      </>,
    );
    const button = screen.getByRole('button', { name: 'Botão' });
    const link = screen.getByRole('link', { name: 'Link' });

    for (const property of SHARED) {
      expect(link.style.getPropertyValue(property)).toBe(button.style.getPropertyValue(property));
    }
    expect(link.style.textDecoration).toBe('none');
  });

  it('defaults to the secondary look, like Button', () => {
    render(
      <>
        <Button>Botão</Button>
        <LinkButton href="#x">Link</LinkButton>
      </>,
    );

    expect(screen.getByRole('link').style.background).toBe(
      screen.getByRole('button').style.background,
    );
  });

  it('opens an external address in a new tab without handing over the page', () => {
    render(
      <LinkButton href="https://example.com" external>
        Fora
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: 'Fora' });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('stays in the same tab when not external', () => {
    render(<LinkButton href="#x">Dentro</LinkButton>);
    const link = screen.getByRole('link', { name: 'Dentro' });

    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('can be named apart from its content', () => {
    render(
      <LinkButton href="#x" aria-label="Conversar no WhatsApp">
        <span aria-hidden="true">▸</span>
      </LinkButton>,
    );

    expect(screen.getByRole('link', { name: 'Conversar no WhatsApp' })).toBeInTheDocument();
  });
});
