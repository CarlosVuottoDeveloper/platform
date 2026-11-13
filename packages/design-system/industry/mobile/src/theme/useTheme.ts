import { color } from '@industry/tokens';

export function useTheme(): { colors: typeof color } {
  return { colors: color };
}
