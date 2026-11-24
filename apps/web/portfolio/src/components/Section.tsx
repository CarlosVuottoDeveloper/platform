import { useId } from 'react';
import type { ReactNode } from 'react';
import { Reveal } from '@industry/web';

interface SectionProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Section({ id, title, subtitle, children }: SectionProps) {
  const headingId = useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      style={{
        display: 'grid',
        gap: 'var(--space-8)',
      }}
    >
      <Reveal>
        <header style={{ display: 'grid', gap: 'var(--space-3)', textAlign: 'center' }}>
          <h2
            id={headingId}
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-heading-weight)',
              fontSize: 'var(--text-h1)',
              color: 'var(--color-text)',
            }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              style={{
                margin: '0 auto',
                maxWidth: '36rem',
                fontSize: 'var(--text-body)',
                color: 'var(--color-neutral-300)',
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </header>
      </Reveal>
      {children}
    </section>
  );
}
