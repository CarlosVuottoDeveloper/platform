import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children as a button', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute('type', 'button');
  });

  it('does not expose a pressed state unless selected is set', () => {
    render(<Button>Admin</Button>);

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
  });

  it('exposes the selected state to assistive tech', () => {
    render(<Button selected>Admin</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('highlights the border and fill when selected', () => {
    render(<Button selected>Admin</Button>);

    expect(screen.getByRole('button')).toHaveStyle({
      borderColor: 'var(--color-accent-400)',
      background: 'color-mix(in srgb, var(--color-accent) 16%, transparent)',
      color: 'var(--color-text)',
    });
  });

  it('wins over the variant skin when selected', () => {
    render(
      <Button variant="primary" selected>
        Admin
      </Button>,
    );

    expect(screen.getByRole('button')).toHaveStyle({
      borderColor: 'var(--color-accent-400)',
      color: 'var(--color-text)',
    });
  });

  it('gives the selected skin its own pressed fill', () => {
    render(<Button selected>Admin</Button>);
    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);

    expect(button).toHaveStyle({
      background: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
    });
  });

  const surfaceOf = (button: HTMLElement) =>
    button.querySelector('[aria-hidden="true"]') as HTMLElement | null;

  it('renders the primary skin on a gradient surface with the accent glow', () => {
    render(<Button variant="primary">Salvar</Button>);
    const button = screen.getByRole('button');
    const surface = surfaceOf(button) as HTMLElement;

    expect(surface).toHaveStyle({
      backgroundImage: 'var(--gradient-primary)',
      boxShadow: 'var(--glow-accent)',
      borderRadius: 'var(--radius-pill)',
    });
    expect(button.firstElementChild).toBe(surface);
  });

  it('keeps an opaque base fill under the primary gradient', () => {
    render(<Button variant="primary">Salvar</Button>);

    expect(screen.getByRole('button').style.background).toBe('var(--color-accent-800)');
  });

  it('stacks the primary surface inside the button so the label stays above it', () => {
    render(<Button variant="primary">Salvar</Button>);

    expect(screen.getByRole('button')).toHaveStyle({ position: 'relative', isolation: 'isolate' });
  });

  it('uses the regular text colour on the primary gradient', () => {
    render(<Button variant="primary">Salvar</Button>);

    expect(screen.getByRole('button')).toHaveStyle({ color: 'var(--color-text)' });
  });

  it('dims the primary surface while hovered and further while pressed', () => {
    render(<Button variant="primary">Salvar</Button>);
    const button = screen.getByRole('button');
    const surface = surfaceOf(button) as HTMLElement;
    expect(surface).toHaveStyle({ opacity: '1' });

    fireEvent.mouseEnter(button);
    expect(surface).toHaveStyle({ opacity: '0.92' });

    fireEvent.mouseDown(button);
    expect(surface).toHaveStyle({ opacity: '0.85' });

    fireEvent.mouseLeave(button);
    expect(surface).toHaveStyle({ opacity: '1' });
  });

  it('shows no glow when a primary button is disabled', () => {
    render(
      <Button variant="primary" disabled>
        Salvar
      </Button>,
    );

    expect((surfaceOf(screen.getByRole('button')) as HTMLElement).style.boxShadow).toBe('');
  });

  it('draws no gradient and no glow when a primary button is selected', () => {
    render(
      <Button variant="primary" selected>
        Admin
      </Button>,
    );

    expect(surfaceOf(screen.getByRole('button'))).toBeNull();
  });

  it('caps a long label at two lines inside the pill', () => {
    render(<Button>{'a'.repeat(200)}</Button>);

    const label = screen.getByText('a'.repeat(200));
    expect(label).toHaveStyle({ textAlign: 'center', overflow: 'hidden' });
    expect(label.style.getPropertyValue('-webkit-line-clamp')).toBe('2');
  });

  it.each([
    ['a number', 3],
    ['an array of strings and numbers', ['Salvar ', 3]],
  ])('clamps %s label like a string', (_name, children) => {
    render(<Button>{children}</Button>);

    const label = screen.getByRole('button').firstElementChild as HTMLElement;
    expect(label.style.getPropertyValue('-webkit-line-clamp')).toBe('2');
  });

  it('leaves an array that holds an element unwrapped', () => {
    render(<Button>{['Salvar ', <b key="b">3</b>]}</Button>);

    expect(screen.getByText('3').parentElement).toBe(screen.getByRole('button'));
  });

  it('renders non-string children without wrapping them', () => {
    render(
      <Button>
        <svg data-testid="icon" />
      </Button>,
    );

    expect(screen.getByRole('button')).toContainElement(screen.getByTestId('icon'));
    expect(screen.getByTestId('icon').parentElement).toBe(screen.getByRole('button'));
  });

  it.each([
    ['md' as const, 'var(--control-h)', 'var(--text-body)'],
    ['sm' as const, 'var(--control-h-sm)', 'var(--text-h6)'],
  ])('uses a pill with the %s control height and type token', (size, height, text) => {
    render(<Button size={size}>Salvar</Button>);

    expect(screen.getByRole('button')).toHaveStyle({
      borderRadius: 'var(--radius-pill)',
      minHeight: height,
      fontSize: text,
    });
  });

  it('makes an icon-only button a circle of the control height', () => {
    render(<Button iconOnly aria-label="Fechar" />);

    expect(screen.getByRole('button')).toHaveStyle({
      width: 'var(--control-h)',
      borderRadius: 'var(--radius-pill)',
    });
  });

  it('fills the secondary variant with surface-2 and a soft border, lighter when pressed', () => {
    render(<Button>Salvar</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveStyle({
      background: 'var(--color-surface-2)',
      borderColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)',
    });

    fireEvent.mouseDown(button);

    expect(button.style.background).toBe('var(--color-neutral-800)');
  });

  it('tints the secondary variant on hover with a fill distinct from rest and pressed', () => {
    render(<Button>Salvar</Button>);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);

    expect(button.style.background).toBe(
      'color-mix(in srgb, var(--color-text) 8%, var(--color-surface-2))',
    );
  });

  it('keeps the ghost variant transparent with accent text and tints it on hover', () => {
    render(<Button variant="ghost">Salvar</Button>);
    const button = screen.getByRole('button');
    expect(button.style.background).toBe('transparent');
    expect(button).toHaveStyle({ color: 'var(--color-accent-300)' });

    fireEvent.mouseEnter(button);

    expect(button.style.background).toBe(
      'color-mix(in srgb, var(--color-accent) 14%, transparent)',
    );
  });

  it('tints the danger variant instead of outlining it', () => {
    render(<Button variant="danger">Excluir</Button>);
    const button = screen.getByRole('button');

    expect(button.style.background).toBe(
      'color-mix(in srgb, var(--color-danger-400) 16%, transparent)',
    );
    expect(button).toHaveStyle({ color: 'var(--color-danger-300)', borderColor: 'transparent' });

    fireEvent.mouseDown(button);

    expect(button.style.background).toBe(
      'color-mix(in srgb, var(--color-danger-400) 28%, transparent)',
    );
  });

  it('keeps the primary box the same size as the secondary by trading its border for padding', () => {
    const boxOf = (props: { variant?: 'primary'; selected?: boolean; size?: 'sm' }) => {
      const { unmount } = render(<Button {...props}>Salvar</Button>);
      const { borderWidth, paddingLeft, paddingRight } = screen.getByRole('button').style;
      unmount();
      return { borderWidth, paddingLeft, paddingRight };
    };

    expect(boxOf({}).borderWidth).toBe('1px');
    expect(boxOf({ variant: 'primary' })).toEqual({
      borderWidth: '0px',
      paddingLeft: 'calc(var(--space-4) + 1px)',
      paddingRight: 'calc(var(--space-4) + 1px)',
    });
    expect(boxOf({ variant: 'primary', size: 'sm' }).paddingLeft).toBe(
      'calc(var(--space-3) + 1px)',
    );
    expect(boxOf({ variant: 'primary', selected: true }).borderWidth).toBe('1px');
  });

  it('dims a disabled button and ignores hover and press on it', () => {
    render(<Button disabled>Salvar</Button>);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);
    fireEvent.mouseDown(button);

    expect(button).toHaveStyle({ opacity: '0.45', cursor: 'not-allowed' });
    expect(button.style.background).toBe('var(--color-surface-2)');
  });

  it('does not suppress the keyboard focus ring', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button').style.outline).toBe('');
  });

  it('lets the consumer style override layout', () => {
    render(<Button style={{ width: 200 }}>Salvar</Button>);

    expect(screen.getByRole('button')).toHaveStyle({ width: '200px' });
  });

  it('releases the pressed fill on mouse up', () => {
    render(<Button>Salvar</Button>);
    const button = screen.getByRole('button');

    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);

    expect(button.style.background).toBe('var(--color-surface-2)');
  });

  it('keeps a caller aria-pressed when the selected prop is not passed', () => {
    render(<Button aria-pressed="true">Opção</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('lets the selected prop win over a caller aria-pressed', () => {
    render(
      <Button selected={false} aria-pressed="true">
        Opção
      </Button>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('leaves aria-pressed off when neither is passed', () => {
    render(<Button>Opção</Button>);

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
  });
});
