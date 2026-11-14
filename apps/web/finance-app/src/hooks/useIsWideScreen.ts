import { useEffect, useState } from 'react';

const WIDE_SCREEN_QUERY = '(min-width: 768px)';

export function useIsWideScreen(): boolean {
  const [isWide, setIsWide] = useState(() => window.matchMedia(WIDE_SCREEN_QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(WIDE_SCREEN_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsWide(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return isWide;
}
