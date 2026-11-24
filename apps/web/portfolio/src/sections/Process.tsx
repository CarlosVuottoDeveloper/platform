import { Card, LinkButton, Reveal } from '@industry/web';
import { Section } from '../components/Section';
import { WHATSAPP_URL } from '../content/contact';
import { PROCESS_STEPS } from '../content/process';
import { useIsWideScreen } from '../hooks/useIsWideScreen';

export function Process() {
  const isWide = useIsWideScreen();

  return (
    <Section
      id="processo"
      title="Como eu trabalho"
      subtitle="Um caminho previsível, com entregas visíveis em cada etapa."
    >
      <ol
        aria-label="Etapas"
        data-testid="process-grid"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: isWide ? 'repeat(4, minmax(0, 1fr))' : 'minmax(0, 1fr)',
        }}
      >
        {PROCESS_STEPS.map((step, index) => (
          <li key={step.id} style={{ display: 'grid' }}>
            <Reveal delay={isWide ? index * 100 : 0} style={{ display: 'grid' }}>
              <Card elevation="sm" style={{ gap: 'var(--space-3)', padding: 'var(--space-6)' }}>
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--font-heading-weight)',
                    fontSize: 'clamp(48px, 6vw, 72px)',
                    lineHeight: 1,
                    background:
                      'linear-gradient(180deg, var(--color-accent-300), var(--color-accent-500))',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {step.number}
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--font-heading-weight)',
                    fontSize: 'var(--text-h4)',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-body)',
                    lineHeight: 1.6,
                    color: 'var(--color-neutral-300)',
                  }}
                >
                  {step.description}
                </p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ol>
      <Reveal>
        <Card
          elevation="sm"
          style={{
            flexDirection: isWide ? 'row' : 'column',
            alignItems: isWide ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            padding: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--font-heading-weight)',
                fontSize: 'var(--text-h4)',
              }}
            >
              Tem um projeto em mente?
            </p>
            <p
              style={{ margin: 0, fontSize: 'var(--text-body)', color: 'var(--color-neutral-300)' }}
            >
              Me conte a ideia e eu te ajudo a tirar do papel.
            </p>
          </div>
          <LinkButton href={WHATSAPP_URL} variant="primary" external>
            Vamos conversar
          </LinkButton>
        </Card>
      </Reveal>
    </Section>
  );
}
