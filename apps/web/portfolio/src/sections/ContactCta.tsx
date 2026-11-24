import { GradientSurface, LinkButton, Reveal } from '@industry/web';
import { WHATSAPP_URL } from '../content/contact';

export function ContactCta() {
  return (
    <Reveal>
      <GradientSurface
        variant="primary"
        glow
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          justifyItems: 'start',
          padding: 'clamp(24px, 5vw, 56px)',
        }}
      >
        <h2
          style={{
            margin: 0,
            maxWidth: '32rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            fontSize: 'var(--text-h1)',
            color: 'var(--color-text)',
          }}
        >
          Tem um produto para tirar do papel?
        </h2>
        <p style={{ margin: 0, maxWidth: '32rem', lineHeight: 1.6, color: 'var(--color-text)' }}>
          Me conte a ideia. Respondo rápido e te digo com sinceridade como posso ajudar, seja um
          site, um app ou um design system.
        </p>
        <LinkButton href={WHATSAPP_URL} external>
          Vamos conversar
        </LinkButton>
      </GradientSurface>
    </Reveal>
  );
}
