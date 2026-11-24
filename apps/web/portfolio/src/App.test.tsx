import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders one page with a single main heading', () => {
    render(<App />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('marks the main content as the skip link target', () => {
    render(<App />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo');
  });

  it('shows the header, the introduction and the projects', () => {
    render(<App />);

    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByText('Onde já trabalhei')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Projetos recentes' })).toBeInTheDocument();
  });
});
