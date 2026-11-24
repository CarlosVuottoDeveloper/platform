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

  it('scrolls to the section named in the address when the page opens', () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState(null, '', '/#sobre');

    render(<App />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toBe(document.getElementById('sobre'));
    window.history.replaceState(null, '', '/');
  });

  it('stays at the top when the address names no section', () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState(null, '', '/#nada-aqui');

    render(<App />);

    expect(scrollIntoView).not.toHaveBeenCalled();
    window.history.replaceState(null, '', '/');
  });
});
