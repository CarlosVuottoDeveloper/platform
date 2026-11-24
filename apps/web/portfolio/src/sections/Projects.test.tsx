import { render, screen, within } from '@testing-library/react';
import { PROJECTS } from '../content/projects';
import { mockWideScreen } from '../test-utils';
import { Projects } from './Projects';

describe('Projects', () => {
  it('links each project card to the live site with its screenshot', () => {
    mockWideScreen(true);
    render(<Projects />);
    const section = screen.getByRole('region', { name: 'Projetos recentes' });

    expect(section).toHaveAttribute('id', 'projetos');
    for (const project of PROJECTS) {
      const link = within(section).getByRole('link', { name: new RegExp(project.name) });
      expect(link).toHaveAttribute('href', project.url);
      expect(
        within(link).getByRole('img', { name: `Página inicial do site ${project.name}` }),
      ).toHaveAttribute('src', project.image);
    }
  });

  it.each([
    [true, 'repeat(2, minmax(0, 1fr))'],
    [false, 'minmax(0, 1fr)'],
  ])('lays the cards out for the screen (wide: %s)', (isWide, columns) => {
    mockWideScreen(isWide);
    render(<Projects />);

    expect(screen.getByTestId('projects-grid').style.gridTemplateColumns).toBe(columns);
  });

  it('centres the last card when an odd number of projects leaves it alone on a wide screen', () => {
    mockWideScreen(true);
    render(<Projects />);
    const cells = [...screen.getByTestId('projects-grid').children] as HTMLElement[];
    const last = cells[cells.length - 1] as HTMLElement;

    expect(last.style.gridColumn).toBe('1 / -1');
    expect(last.style.justifySelf).toBe('center');
    expect(cells[0]?.style.gridColumn).toBe('');
  });
});
