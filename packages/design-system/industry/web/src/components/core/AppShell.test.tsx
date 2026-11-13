import { render, screen } from '@testing-library/react';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders the sidebar, header and page body', () => {
    render(
      <AppShell sidebar={<nav>Sidebar</nav>} header={<span>Header</span>}>
        <p>Body</p>
      </AppShell>,
    );

    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('omits the header row when none is given', () => {
    render(<AppShell>Body only</AppShell>);

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('draws the top bar transparent, without a divider, with a heading-weight title', () => {
    render(<AppShell header={<span>Header</span>}>Body</AppShell>);
    const header = screen.getByRole('banner');

    expect(header.style.background).toBe('transparent');
    expect(header.style.borderBottomWidth).toBe('');
    expect(header.style.fontSize).toBe('var(--text-h4)');
    expect(header.style.fontWeight).toBe('var(--font-heading-weight)');
  });

  it('paints the content area with the page background', () => {
    render(<AppShell>Body only</AppShell>);

    expect(screen.getByText('Body only').style.background).toBe('var(--color-bg)');
  });
});
