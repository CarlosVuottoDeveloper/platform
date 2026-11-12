import { renderHook } from '@testing-library/react-native';
import { Appearance } from 'react-native';
import { color } from '@industry/tokens';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the single Industry color set even when the OS is in light mode', () => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    const { result } = renderHook(() => useTheme());
    expect(result.current).toEqual({ colors: color });
  });
});
