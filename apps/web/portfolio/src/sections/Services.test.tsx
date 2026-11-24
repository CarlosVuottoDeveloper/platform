import { render, screen, within } from '@testing-library/react';
import { SERVICES } from '../content/services';
import { mockWideScreen } from '../test-utils';
import { Services } from './Services';

describe('Services', () => {
  it('describes each service in its own card', () => {
    mockWideScreen(true);
    render(<Services />);
    const section = screen.getByRole('region', { name: 'Serviços' });

    expect(section).toHaveAttribute('id', 'servicos');
    expect(within(section).getAllByTestId('service-card')).toHaveLength(SERVICES.length);
    for (const service of SERVICES) {
      expect(within(section).getByText(service.title)).toBeInTheDocument();
      expect(within(section).getByText(service.description)).toBeInTheDocument();
    }
  });

  it.each([
    [true, 'repeat(2, minmax(0, 1fr))'],
    [false, 'minmax(0, 1fr)'],
  ])('lays the cards out for the screen (wide: %s)', (isWide, columns) => {
    mockWideScreen(isWide);
    render(<Services />);

    expect(screen.getByTestId('services-grid').style.gridTemplateColumns).toBe(columns);
  });

  it('sets each description in body-size text so it reads comfortably on a phone', () => {
    mockWideScreen(false);
    render(<Services />);

    SERVICES.forEach((service) =>
      expect(screen.getByText(service.description).style.fontSize).toBe('var(--text-body)'),
    );
  });
});
