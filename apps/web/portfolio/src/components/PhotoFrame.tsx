const CIRCLE_WITH_OPEN_TOP = [
  'radial-gradient(circle closest-side at 50% 50%, black 83%, transparent 85%)',
  'linear-gradient(to bottom, black 32%, transparent 44%)',
].join(', ');

interface PhotoFrameProps {
  src: string;
  alt: string;
  size: number;
}

export function PhotoFrame({ src, alt, size }: PhotoFrameProps) {
  return (
    <div
      data-testid="photo-frame"
      style={{
        position: 'relative',
        width: `${size}px`,
        maxWidth: '100%',
        aspectRatio: '1 / 1',
        display: 'grid',
        placeItems: 'end center',
      }}
    >
      <div
        data-testid="photo-glow"
        style={{
          position: 'absolute',
          inset: '8%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 40%, var(--color-accent-500) 0%, color-mix(in srgb, var(--color-accent-700) 70%, transparent) 55%, transparent 72%)',
          boxShadow: 'var(--glow-accent)',
        }}
      />
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom',
            maskImage: CIRCLE_WITH_OPEN_TOP,
            WebkitMaskImage: CIRCLE_WITH_OPEN_TOP,
          }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{
            position: 'relative',
            alignSelf: 'center',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            fontSize: 'var(--text-h1)',
            color: 'var(--color-text)',
            letterSpacing: '0.08em',
          }}
        >
          CV
        </span>
      )}
    </div>
  );
}
