import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface RevealProps {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  testID?: string;
}

function canObserve(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

export function Reveal({ children, delay = 0, style, testID }: RevealProps) {
  const reduceMotion = usePrefersReducedMotion();
  const animated = !reduceMotion && canObserve();
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated) return undefined;
    const showForPrint = () => setShown(true);
    window.addEventListener('beforeprint', showForPrint);
    return () => window.removeEventListener('beforeprint', showForPrint);
  }, [animated]);

  useEffect(() => {
    if (!animated || !ref.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animated]);

  const motion: CSSProperties = animated
    ? {
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(16px)',
        transition: 'opacity 500ms ease, transform 500ms ease',
        transitionDelay: `${delay}ms`,
      }
    : {};

  return (
    <div ref={ref} data-testid={testID} style={{ ...motion, ...style }}>
      {children}
    </div>
  );
}
