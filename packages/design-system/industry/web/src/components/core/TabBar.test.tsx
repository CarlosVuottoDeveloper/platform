import { fireEvent, render, screen } from '@testing-library/react';
import { TabBar } from './TabBar';

const ITEMS = [
  { id: 'home', label: 'Início' },
  { id: 'profile', label: 'Perfil' },
];

describe('TabBar', () => {
  it('renders every item', () => {
    render(<TabBar items={ITEMS} />);

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('marks the current item as the active page', () => {
    render(<TabBar items={ITEMS} current="profile" />);

    expect(screen.getByText('Perfil').closest('button')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Início').closest('button')).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with the pressed item id', () => {
    const onSelect = jest.fn();
    render(<TabBar items={ITEMS} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Perfil'));

    expect(onSelect).toHaveBeenCalledWith('profile');
  });

  it('is a navigation landmark whose items are plain buttons without tab roles', () => {
    render(<TabBar items={ITEMS} current="profile" />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Perfil' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Perfil' })).not.toHaveAttribute('aria-selected');
  });

  it('draws a surface bar with rounded top corners and no hairline', () => {
    render(<TabBar items={ITEMS} />);
    const bar = screen.getByRole('navigation');

    expect(bar.style.background).toBe('var(--color-surface)');
    expect(bar.style.borderTopLeftRadius).toBe('var(--radius-lg)');
    expect(bar.style.borderTopRightRadius).toBe('var(--radius-lg)');
    expect(bar.style.borderTopWidth).toBe('');
  });

  it('pads the bar by the space token plus the safe area', () => {
    render(<TabBar items={ITEMS} />);
    const bar = screen.getByRole('navigation');

    expect(bar.style.paddingTop).toBe('var(--space-2)');
    expect(bar.style.paddingBottom).toBe('calc(var(--space-2) + var(--safe-b))');
  });

  const ICON_ITEMS = [
    { id: 'home', label: 'Início', icon: <i data-testid="icon-home" /> },
    { id: 'profile', label: 'Perfil', icon: <i data-testid="icon-profile" /> },
  ];

  it('puts the active icon in a glowing primary circle', () => {
    render(<TabBar items={ICON_ITEMS} current="home" />);
    const wrapper = screen.getByTestId('icon-home').parentElement as HTMLElement;
    const surface = wrapper.querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(surface.style.backgroundImage).toBe('var(--gradient-primary)');
    expect(surface.style.boxShadow).toBe('var(--glow-accent)');
    expect(surface.style.borderRadius).toBe('var(--radius-pill)');
    expect(wrapper.style.opacity).toBe('1');
  });

  it('dims the inactive icon and gives it no surface', () => {
    render(<TabBar items={ICON_ITEMS} current="home" />);
    const wrapper = screen.getByTestId('icon-profile').parentElement as HTMLElement;

    expect(wrapper.style.opacity).toBe('0.6');
    expect(wrapper.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('colours the labels by state and weights the active one', () => {
    render(<TabBar items={ITEMS} current="home" />);

    expect(screen.getByText('Início').style.color).toBe('var(--color-accent-300)');
    expect(screen.getByText('Início').style.fontWeight).toBe('var(--font-medium-weight)');
    expect(screen.getByText('Perfil').style.color).toBe('var(--color-neutral-400)');
    expect(screen.getByText('Perfil').style.fontWeight).toBe('');
  });

  it('brightens an inactive item on hover', () => {
    render(<TabBar items={ICON_ITEMS} current="home" />);
    const tab = screen.getByRole('button', { name: 'Perfil' });
    const wrapper = screen.getByTestId('icon-profile').parentElement as HTMLElement;

    fireEvent.mouseEnter(tab);
    expect(wrapper.style.opacity).toBe('0.85');
    expect(screen.getByText('Perfil').style.color).toBe('var(--color-neutral-200)');

    fireEvent.mouseLeave(tab);
    expect(wrapper.style.opacity).toBe('0.6');
  });

  it('keeps every item at least one tap target tall', () => {
    render(<TabBar items={ITEMS} />);

    expect(screen.getByRole('button', { name: 'Perfil' }).style.minHeight).toBe('var(--tap)');
  });
});
