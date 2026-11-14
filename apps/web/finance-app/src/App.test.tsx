import { render, screen } from '@testing-library/react';
import { App } from './App';
import { mockSignedInAs } from './test-utils';

jest.mock('./services/authService');

describe('App', () => {
  it('renders the login screen for a signed-out visitor', () => {
    mockSignedInAs(null);

    render(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar com Google' })).toBeInTheDocument();
  });
});
