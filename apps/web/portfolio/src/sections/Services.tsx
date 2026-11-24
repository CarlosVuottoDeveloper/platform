import { Card, Icon, IconBubble, Reveal } from '@industry/web';
import { Section } from '../components/Section';
import { SECTION_IDS } from '../content/navigation';
import { SERVICES } from '../content/services';
import { useIsWideScreen } from '../hooks/useIsWideScreen';

export function Services() {
  const isWide = useIsWideScreen();

  return (
    <Section
      id={SECTION_IDS.services}
      title="Serviços"
      subtitle="Do primeiro pixel ao componente reutilizável. Escolha uma frente ou combine todas."
    >
      <div
        data-testid="services-grid"
        style={{
          display: 'grid',
          gap: 'var(--space-6)',
          gridTemplateColumns: isWide ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
        }}
      >
        {SERVICES.map((service, index) => (
          <Reveal
            key={service.id}
            delay={isWide ? (index % 2) * 120 : 0}
            style={{ display: 'grid' }}
          >
            <Card
              data-testid="service-card"
              elevation="sm"
              style={{ gap: 'var(--space-3)', padding: 'var(--space-6)' }}
            >
              <IconBubble>
                <Icon name={service.icon} size="md" />
              </IconBubble>
              <h3
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--font-heading-weight)',
                  fontSize: 'var(--text-h4)',
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-h6)',
                  lineHeight: 1.6,
                  color: 'var(--color-neutral-300)',
                }}
              >
                {service.description}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
