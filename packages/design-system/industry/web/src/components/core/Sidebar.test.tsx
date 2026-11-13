import { fireEvent, render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

const ITEMS = [
  { section: 'Workspace' },
  { id: 'home', label: 'Início' },
  { id: 'projects', label: 'Projetos' },
];

describe('Sidebar', () => {
  it('renders the brand, section labels and items', () => {
    render(<Sidebar brand="Industry" items={ITEMS} />);

    expect(screen.getByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Projetos')).toBeInTheDocument();
  });

  it('marks the current item as the active page', () => {
    render(<Sidebar items={ITEMS} current="projects" />);

    expect(screen.getByText('Projetos').closest('a')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Início').closest('a')).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with the item id and prevents navigation', () => {
    const onSelect = jest.fn();
    render(<Sidebar items={ITEMS} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Projetos'));

    expect(onSelect).toHaveBeenCalledWith('projects');
  });

  it('renders the footer', () => {
    render(<Sidebar items={ITEMS} footer={<span>v1.0.0</span>} />);

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('draws a surface sidebar without a divider', () => {
    render(<Sidebar items={ITEMS} />);
    const nav = screen.getByRole('navigation');

    expect(nav.style.background).toBe('var(--color-surface)');
    expect(nav.style.borderRightWidth).toBe('');
  });

  it('draws the active item as a deep-accent pill with a text label', () => {
    render(<Sidebar items={ITEMS} current="projects" />);
    const link = screen.getByText('Projetos').closest('a') as HTMLElement;

    expect(link.style.background).toBe('var(--color-accent-800)');
    expect(link.style.color).toBe('var(--color-text)');
    expect(link.style.borderRadius).toBe('var(--radius-pill)');
  });

  it('draws inactive items neutral and tints them on hover', () => {
    render(<Sidebar items={ITEMS} current="projects" />);
    const link = screen.getByText('Início').closest('a') as HTMLElement;

    expect(link.style.color).toBe('var(--color-neutral-400)');
    expect(link.style.background).toBe('transparent');

    fireEvent.mouseEnter(link);
    expect(link.style.background).toBe('color-mix(in srgb, var(--color-text) 8%, transparent)');
    expect(link.style.color).toBe('var(--color-neutral-200)');

    fireEvent.mouseDown(link);
    expect(link.style.background).toBe('color-mix(in srgb, var(--color-text) 14%, transparent)');

    fireEvent.mouseLeave(link);
    expect(link.style.background).toBe('transparent');
  });

  it('deepens the active pill on hover and press', () => {
    render(<Sidebar items={ITEMS} current="projects" />);
    const link = screen.getByText('Projetos').closest('a') as HTMLElement;

    fireEvent.mouseEnter(link);
    expect(link.style.background).toBe('var(--color-accent-700)');

    fireEvent.mouseDown(link);
    expect(link.style.background).toBe('var(--color-accent-600)');
  });

  it('keeps every link at least one tap target tall', () => {
    render(<Sidebar items={ITEMS} />);

    expect((screen.getByText('Início').closest('a') as HTMLElement).style.minHeight).toBe(
      'var(--tap)',
    );
  });
});
