import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { GradientSurface } from './GradientSurface';
import { Icon } from './Icon';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface MediaCardProps {
  image: { src: string; alt: string };
  kicker?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  href?: string;
  style?: CSSProperties;
  testID?: string;
}

export function MediaCard({ image, kicker, title, body, href, style, testID }: MediaCardProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [hovered, setHovered] = useState(false);
  const lifted = hovered && !reduceMotion;

  const content = (
    <>
      <img
        src={image.src}
        alt={href ? '' : image.alt}
        loading="lazy"
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: '16 / 10',
          objectFit: 'cover',
          objectPosition: 'top',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-2)',
        }}
      />
      <div style={{ display: 'grid', gap: 'var(--space-1)', minWidth: 0 }}>
        {kicker ? (
          <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-accent-300)' }}>
            {kicker}
          </span>
        ) : null}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            fontSize: 'var(--text-h4)',
            color: 'var(--color-text)',
          }}
        >
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{title}</span>
          {href ? <Icon name="arrow-up-right" size="sm" color="var(--color-accent-300)" /> : null}
        </span>
        {body ? (
          <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
            {body}
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <GradientSurface
      data-testid={testID}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid var(--color-divider)',
        boxShadow: lifted ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: lifted ? 'translateY(-4px)' : undefined,
        transition: reduceMotion ? undefined : 'transform 200ms ease, box-shadow 200ms ease',
        ...style,
      }}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'grid',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            color: 'inherit',
            textDecoration: 'none',
            borderRadius: 'inherit',
          }}
        >
          {content}
        </a>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-3)', padding: 'var(--space-3)' }}>
          {content}
        </div>
      )}
    </GradientSurface>
  );
}
