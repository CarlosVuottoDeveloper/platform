import { render } from '@testing-library/react';
import { useAuth } from './AuthContext';

jest.mock('../../services/authService');

function Probe() {
  useAuth();
  return null;
}

describe('useAuth', () => {
  it('refuses to be used outside its provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrow('useAuth precisa de um AuthProvider');
    consoleError.mockRestore();
  });
});
