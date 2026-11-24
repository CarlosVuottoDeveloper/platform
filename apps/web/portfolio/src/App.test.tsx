import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders one page with a single main heading', () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
